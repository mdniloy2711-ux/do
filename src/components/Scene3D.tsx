import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

const vertex = /* glsl */ `
  attribute vec3 aSphere;
  attribute vec3 aKnot;
  attribute vec3 aWave;
  attribute vec3 aGalaxy;
  attribute float aRand;
  uniform float uTime;
  uniform float uMorph;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec3 uColor;
  uniform vec3 uColor2;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float m1 = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
    float m2 = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
    float m3 = smoothstep(0.0, 1.0, clamp(uMorph - 2.0, 0.0, 1.0));
    vec3 p = mix(aSphere, aKnot, m1);
    p = mix(p, aWave, m2);
    p = mix(p, aGalaxy, m3);

    float waveW = clamp(1.0 - abs(uMorph - 2.0), 0.0, 1.0);
    p.y += (sin(p.x * 1.1 + uTime * 1.3) * 0.35 + cos(p.z * 1.6 + uTime * 0.9) * 0.25) * waveW;

    float breathe = sin(uTime * 1.4 + aRand * 6.2831) * 0.05;
    p += normalize(p + 0.0001) * breathe;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uMouse;
    d.x *= uAspect;
    float force = smoothstep(0.38, 0.0, length(d));
    mv.xy += normalize(d + 0.0001) * force * 0.9;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.45 + aRand) / -mv.z;
    vColor = mix(uColor, uColor2, clamp(aRand * 0.55 + force * 1.2, 0.0, 1.0));
    vAlpha = 0.3 + 0.7 * aRand;
  }
`;

const fragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha * uOpacity);
  }
`;

function buildShapes(n: number) {
  const sphere = new Float32Array(n * 3);
  const knot = new Float32Array(n * 3);
  const wave = new Float32Array(n * 3);
  const galaxy = new Float32Array(n * 3);
  const rand = new Float32Array(n);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const side = Math.ceil(Math.sqrt(n));

  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    rand[i] = Math.random();

    // fibonacci sphere
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const R = 2.55 + (Math.random() - 0.5) * 0.12;
    sphere[i3] = Math.cos(th) * r * R;
    sphere[i3 + 1] = y * R;
    sphere[i3 + 2] = Math.sin(th) * r * R;

    // torus knot (p=2, q=3)
    const t = (i / n) * Math.PI * 2;
    const kr = Math.cos(3 * t) + 2;
    const tube = 0.28 * Math.sqrt(Math.random());
    const ta = Math.random() * Math.PI * 2;
    knot[i3] = (kr * Math.cos(2 * t)) * 0.85 + Math.cos(ta) * tube;
    knot[i3 + 1] = (kr * Math.sin(2 * t)) * 0.85 + Math.sin(ta) * tube;
    knot[i3 + 2] = -Math.sin(3 * t) * 0.85 + Math.cos(ta + 1) * tube;

    // wave plane
    const gx = i % side;
    const gz = Math.floor(i / side);
    wave[i3] = (gx / side - 0.5) * 12;
    wave[i3 + 1] = -0.6;
    wave[i3 + 2] = (gz / side - 0.5) * 8;

    // spiral galaxy
    const branches = 4;
    const gr = Math.pow(Math.random(), 1.6) * 4.8 + 0.1;
    const angle = ((i % branches) / branches) * Math.PI * 2 + gr * 1.1;
    const spread = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.6 * gr * 0.4;
    galaxy[i3] = Math.cos(angle) * gr + spread;
    galaxy[i3 + 1] = (Math.random() - 0.5) * 0.35 * (1.2 - gr / 5);
    galaxy[i3 + 2] = Math.sin(angle) * gr + spread;
  }
  return { sphere, knot, wave, galaxy, rand };
}

const SECTION_MORPH: [string, number][] = [
  ["home", 0],
  ["about", 1],
  ["skills", 1.35],
  ["personal-info", 1.7],
  ["bncc", 2],
  ["beyond", 2.4],
  ["education", 2],
  ["portfolio", 3],
];

export default function Scene3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL support – site still works without it
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    const count = mobile ? 4500 : 11000;
    const pr = Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75);
    renderer.setPixelRatio(pr);

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, mobile ? 9.5 : 7.2);

    const s = buildShapes(count);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(s.sphere, 3));
    geo.setAttribute("aSphere", new BufferAttribute(s.sphere, 3));
    geo.setAttribute("aKnot", new BufferAttribute(s.knot, 3));
    geo.setAttribute("aWave", new BufferAttribute(s.wave, 3));
    geo.setAttribute("aGalaxy", new BufferAttribute(s.galaxy, 3));
    geo.setAttribute("aRand", new BufferAttribute(s.rand, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uSize: { value: mobile ? 34 : 30 },
      uPixelRatio: { value: pr },
      uAspect: { value: 1 },
      uOpacity: { value: 0 },
      uMouse: { value: new Vector2(9, 9) },
      uColor: { value: new Color("#f4f2ec") },
      uColor2: { value: new Color("#8f8d86") },
    };
    const mat = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const group = new Group();
    group.add(new Points(geo, mat));
    scene.add(group);

    // ---- state ----
    const mouse = { x: 9, y: 9, tx: 9, ty: 9, px: 0, py: 0 };
    let anchors: [number, number][] = [];
    let lastScroll = window.scrollY;
    let spin = 0;
    let morph = 0;
    let frame = 0;
    let raf = 0;

    const measure = () => {
      anchors = SECTION_MORPH.map(([id, m]) => {
        const el = document.getElementById(id);
        return [el ? el.getBoundingClientRect().top + window.scrollY : 0, m] as [number, number];
      }).sort((a, b) => a[0] - b[0]);
    };
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = w / h;
      measure();
    };
    const readAccent = () => {
      const a = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (a) uniforms.uColor.value.set(a);
    };
    const targetMorph = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      if (!anchors.length || y <= anchors[0][0]) return anchors[0]?.[1] ?? 0;
      for (let i = 0; i < anchors.length - 1; i++) {
        const [y0, m0] = anchors[i];
        const [y1, m1] = anchors[i + 1];
        if (y < y1) return m0 + ((y - y0) / Math.max(1, y1 - y0)) * (m1 - m0);
      }
      return anchors[anchors.length - 1][1];
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onLeave = () => { mouse.tx = 9; mouse.ty = 9; };

    resize();
    readAccent();
    const measureTimer = window.setInterval(measure, 2000);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);

    const start = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      frame++;
      const t = (performance.now() - start) / 1000;
      if (frame % 30 === 0) readAccent();

      const sy = window.scrollY;
      const vel = sy - lastScroll;
      lastScroll = sy;
      spin += (Math.min(Math.abs(vel), 80) * 0.0006 - spin) * 0.08;

      morph += (targetMorph() - morph) * 0.06;
      uniforms.uMorph.value = morph;
      uniforms.uTime.value = t;
      const targetOpacity = mobile ? 0.75 : 0.9;
      uniforms.uOpacity.value = reduced ? targetOpacity : uniforms.uOpacity.value + (targetOpacity - uniforms.uOpacity.value) * 0.02;
      if (reduced) morph = targetMorph();

      // mouse smoothing (snap when far away so it doesn't sweep across)
      if (Math.abs(mouse.tx - mouse.x) > 3) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      uniforms.uMouse.value.set(mouse.x, mouse.y);
      const px = Math.abs(mouse.tx) > 2 ? 0 : mouse.tx;
      const py = Math.abs(mouse.ty) > 2 ? 0 : mouse.ty;
      mouse.px += (px - mouse.px) * 0.04;
      mouse.py += (py - mouse.py) * 0.04;

      // per-shape framing
      const tiltX = [0, 0.35, 0.5, 1.05];
      const lo = Math.floor(Math.min(2.999, Math.max(0, morph)));
      const f = Math.min(1, Math.max(0, morph - lo));
      const baseTilt = tiltX[lo] + (tiltX[lo + 1] - tiltX[lo]) * f;

      group.rotation.y += 0.0016 + spin;
      group.rotation.x += (baseTilt - mouse.py * 0.25 - group.rotation.x) * 0.05;
      group.rotation.z += (mouse.px * 0.12 - group.rotation.z) * 0.05;
      group.position.y = Math.sin(t * 0.6) * 0.08;

      renderer.render(scene, camera);
      if (reduced) cancelAnimationFrame(raf);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(measureTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
