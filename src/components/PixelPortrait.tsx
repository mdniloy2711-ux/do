import { useEffect, useRef, type RefObject } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";


const vertex = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec3 aStart;
  attribute vec3 aColor;
  attribute float aRand;
  attribute float aAlpha;
  attribute float aSize;

  uniform float uTime;
  uniform float uAssembly;
  uniform float uScatter;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform vec2 uMouse;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float delay = aRand * 0.32;
    float p = clamp((uAssembly * 1.32 - delay) / (1.0 - delay), 0.0, 1.0);
    float e = 1.0 - pow(1.0 - p, 3.0);

    // fly in from the surrounding page, settling into the portrait
    vec3 pos = mix(aStart, aTarget, e);

    // subtle life once formed
    pos.xy += vec2(sin(uTime * 0.9 + aRand * 6.2831), cos(uTime * 0.75 + aRand * 4.712)) * 1.7 * e;

    // pointer repulsion
    vec2 d = pos.xy - uMouse;
    float dist = length(d);
    float force = smoothstep(150.0, 0.0, dist) * e;
    pos.xy += normalize(d + vec2(0.0001)) * force * 16.0;

    // dissolve on scroll
    vec2 dir = normalize(aTarget.xy + vec2(0.0001));
    pos.xy += dir * uScatter * (260.0 + aRand * 900.0);
    pos.x += sin(aRand * 24.0) * uScatter * 260.0;
    pos.y += cos(aRand * 19.0) * uScatter * 200.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (1.0 + (1.0 - e) * 0.55) * (1.0 + force * 0.4);
    vColor = aColor;
    vAlpha = aAlpha * e * (1.0 - uScatter * 0.85) * uOpacity;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float sq = max(abs(uv.x), abs(uv.y));
    float a = smoothstep(0.5, 0.43, sq);
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

type Grid = { cols: number; rows: number; data: Uint8ClampedArray; aspect: number };

function decode(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image failed: ${src}`));
    img.src = src;
  });
}

/** Samples only pixels, so an arched silhouette can be cut out of the frame. */
function sample(img: HTMLImageElement, cols: number, aspect: number): Grid {
  const rows = Math.max(8, Math.round(cols / Math.max(0.2, aspect)));
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const imgAspect = iw / ih;
  let sw = iw;
  let sh = ih;
  if (imgAspect > aspect) sw = ih * aspect;
  else sh = iw / aspect;
  const sx = (iw - sw) * 0.5;
  const sy = (ih - sh) * 0.24;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  return { cols, rows, data, aspect };
}

export default function PixelPortrait({
  anchorRef,
  ready,
  replay,
  onResult,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  ready: boolean;
  replay: number;
  onResult?: (ok: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ ready: false, reset: true });
  const resultRef = useRef(onResult);
  resultRef.current = onResult;

  useEffect(() => {
    state.current.ready = ready;
  }, [ready]);

  useEffect(() => {
    state.current.reset = true;
  }, [replay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    if (!canvas || !anchor) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch {
      resultRef.current?.(false);
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 4000);
    camera.position.z = 1000;

    const uniforms = {
      uTime: { value: 0 },
      uAssembly: { value: 0 },
      uScatter: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0 },
      uMouse: { value: new Vector2(1e5, 1e5) },
    };
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const points = new Points(new BufferGeometry(), material);
    points.frustumCulled = false;
    scene.add(points);

    let img: HTMLImageElement | null = null;
    let grid: Grid | null = null;
    let disposed = false;
    let assembly = 0;
    let scatter = 0;
    let raf = 0;
    let resizeTimer = 0;
    let last = performance.now();
    const mouse = { x: 1e5, y: 1e5, tx: 1e5, ty: 1e5 };
    let heroTop = 0;
    let heroH = window.innerHeight;

    const measureHero = () => {
      const section = canvas.closest("section");
      if (!section) return;
      const r = section.getBoundingClientRect();
      heroTop = r.top + window.scrollY;
      heroH = section.offsetHeight || window.innerHeight;
    };

    const build = () => {
      if (!grid) return;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const ar = anchor.getBoundingClientRect();
      if (cw < 20 || ch < 20 || ar.width < 20 || ar.height < 20) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(cw, ch, false);
      camera.left = -cw / 2;
      camera.right = cw / 2;
      camera.top = ch / 2;
      camera.bottom = -ch / 2;
      camera.updateProjectionMatrix();
      uniforms.uPixelRatio.value = dpr;

      const cr = canvas.getBoundingClientRect();
      const left = ar.left - cr.left;
      const top = ar.top - cr.top;
      const rw = ar.width;
      const rh = ar.height;
      const { cols, rows, data } = grid;

      const rTop = Math.min(rw / 2, rh / 2);
      const rb = Math.min(26, rw / 2, rh / 2);
      const inside = (x: number, y: number) => {
        if (y < rTop) {
          const dx = x - rw / 2;
          const dy = y - rTop;
          if (dx * dx + dy * dy > rTop * rTop) return false;
        }
        if (x < rb && y > rh - rb) {
          if ((x - rb) ** 2 + (y - (rh - rb)) ** 2 > rb * rb) return false;
        }
        if (x > rw - rb && y > rh - rb) {
          if ((x - (rw - rb)) ** 2 + (y - (rh - rb)) ** 2 > rb * rb) return false;
        }
        return true;
      };

      const target: number[] = [];
      const start: number[] = [];
      const color: number[] = [];
      const rand: number[] = [];
      const alpha: number[] = [];
      const size: number[] = [];
      const cellW = rw / cols;
      const cellH = rh / rows;
      const point = Math.max(1.3, Math.min(cellW, cellH) * 0.82);
      const ring = Math.max(cw, ch) * 0.72;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const a = data[i + 3];
          if (a < 30) continue;
          const px = (c + 0.5) * cellW;
          const py = (r + 0.5) * cellH;
          if (!inside(px, py)) continue;
          const cr_ = data[i];
          const cg = data[i + 1];
          const cb = data[i + 2];
          if (cr_ + cg + cb < 18) continue;

          const tx = left + px - cw / 2;
          const ty = ch / 2 - (top + py);
          const rnd = Math.random();
          const angle = Math.random() * Math.PI * 2;
          const radius = ring * (0.65 + Math.random() * 0.9);

          target.push(tx, ty, 0);
          start.push(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.9, 0);
          color.push((cr_ / 255) ** 1.05, (cg / 255) ** 1.05, (cb / 255) ** 1.05);
          rand.push(rnd);
          alpha.push(0.45 + (rnd * 0.45));
          size.push(point * (0.85 + rnd * 0.3));
        }
      }

      const old = points.geometry;
      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(new Float32Array(target), 3));
      geo.setAttribute("aTarget", new BufferAttribute(new Float32Array(target), 3));
      geo.setAttribute("aStart", new BufferAttribute(new Float32Array(start), 3));
      geo.setAttribute("aColor", new BufferAttribute(new Float32Array(color), 3));
      geo.setAttribute("aRand", new BufferAttribute(new Float32Array(rand), 1));
      geo.setAttribute("aAlpha", new BufferAttribute(new Float32Array(alpha), 1));
      geo.setAttribute("aSize", new BufferAttribute(new Float32Array(size), 1));
      points.geometry = geo;
      old.dispose();
      measureHero();
    };

    const resample = () => {
      if (!img) return;
      const ar = anchor.getBoundingClientRect();
      const aspect = Math.max(0.2, ar.width / Math.max(1, ar.height));
      const cols = window.innerWidth < 768 ? 58 : 104;
      try {
        grid = sample(img, cols, aspect);
        build();
        uniforms.uOpacity.value = 0;
      } catch {
        resultRef.current?.(false);
      }
    };

    const load = async () => {
      for (const src of ["https://nirob120.netlify.app/yes.jpg", "/nirob/yes.jpg", "nirob/yes.jpg", "public/nirob/yes.jpg"]) {
        try {
          const loaded = await decode(src);
          if (disposed) return;
          img = loaded;
          resample();
          resultRef.current?.(true);
          return;
        } catch {
          /* try next source */
        }
      }
      resultRef.current?.(false);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left - r.width / 2;
      mouse.ty = r.height / 2 - (e.clientY - r.top);
    };
    const onLeave = () => {
      mouse.tx = 1e5;
      mouse.ty = 1e5;
    };
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (img) resample();
        measureHero();
      }, 180);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    const anchorObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => img && resample(), 180);
    });
    anchorObserver.observe(anchor);

    measureHero();
    load();
    const extra = window.setTimeout(() => img && build(), 900);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(64, now - last) / 1000;
      last = now;

      const st = state.current;
      if (st.reset) {
        assembly = 0;
        st.reset = false;
      }
      if (st.ready) assembly = Math.min(1, assembly + dt / (reduced ? 0.01 : 2.05));

      const targetScatter = Math.min(1, Math.max(0, (window.scrollY - heroTop) / Math.max(240, heroH * 0.52)));
      scatter += (targetScatter - scatter) * 0.09;

      if (Math.abs(mouse.tx - mouse.x) > 8000) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
      mouse.x += (mouse.tx - mouse.x) * 0.09;
      mouse.y += (mouse.ty - mouse.y) * 0.09;

      uniforms.uTime.value = now / 1000;
      uniforms.uAssembly.value = assembly;
      uniforms.uScatter.value = scatter;
      uniforms.uOpacity.value = Math.min(1, uniforms.uOpacity.value + dt * 1.6);
      uniforms.uMouse.value.set(mouse.x, mouse.y);
      renderer.render(scene, camera);
      if (reduced) cancelAnimationFrame(raf);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(extra);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      anchorObserver.disconnect();
      points.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 h-full w-full" />;
}
