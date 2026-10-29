import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";

/* ---------- Scroll-velocity marquee (speeds up & skews with scroll) ---------- */
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

export function VelocityMarquee({
  items,
  baseVelocity = 3,
  className = "",
  sep = "✦",
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
  sep?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const skewX = useTransform(smooth, [-2500, 2500], [14, -14]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * Math.abs(move) * Math.abs(f) * Math.sign(baseVelocity || 1);
    baseX.set(baseX.get() + move);
  });

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6">{t}</span>
          <span className="text-[0.5em] opacity-70">{sep}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div className="flex" style={{ x, skewX }}>
        {row}
        {row}
      </motion.div>
    </div>
  );
}

/* ---------- Text scramble / decode ---------- */
const GLYPHS = "!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function Scramble({ text, className = "", hover = true }: { text: string; className?: string; hover?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const [out, setOut] = useState(text);
  const timer = useRef<number | undefined>(undefined);

  const run = () => {
    window.clearInterval(timer.current);
    const starts = text.split("").map((_, i) => Math.floor((i / text.length) * 14 + Math.random() * 6));
    let frame = 0;
    timer.current = window.setInterval(() => {
      frame++;
      let done = true;
      const s = text
        .split("")
        .map((c, i) => {
          if (c === " ") return " ";
          if (frame >= starts[i] + 6) return c;
          done = false;
          return frame < starts[i] ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setOut(s);
      if (done) window.clearInterval(timer.current);
    }, 32);
  };

  useEffect(() => {
    if (inView) run();
    return () => window.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text]);

  return (
    <span ref={ref} aria-label={text} onMouseEnter={hover ? run : undefined} className={`inline-block whitespace-pre ${className}`}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

/* ---------- Scroll-linked 3D flip-up line ---------- */
export function ScrollFlip({ children, className = "", from = -95 }: { children: ReactNode; className?: string; from?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.5"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [from, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.45, 1], [0, 0.5, 1]);
  return (
    <div ref={ref} className={className} style={{ perspective: 900 }}>
      <motion.div style={{ rotateX, y, opacity, transformOrigin: "50% 100% -60px" }}>{children}</motion.div>
    </div>
  );
}

/* ---------- Section 3D tilt-up entrance ---------- */
export function Reveal3D({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.15"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const rotateX = useTransform(p, [0, 1], [22, 0]);
  const scale = useTransform(p, [0, 1], [0.86, 1]);
  const y = useTransform(p, [0, 1], [120, 0]);
  return (
    <div ref={ref} className={className} style={{ perspective: 2000 }}>
      <motion.div style={{ rotateX, scale, y, transformOrigin: "50% 0%" }}>{children}</motion.div>
    </div>
  );
}
import { ease } from "../lib";

/* ---------- Magnetic wrapper ---------- */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.3 });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  return (
    <motion.div style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}

/* ---------- Rolling text button label ---------- */
export function RollText({ children }: { children: string }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute left-0 top-full transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full">{children}</span>
    </span>
  );
}

/* ---------- Split characters reveal ---------- */
export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.035,
  play,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  play?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const show = play === undefined ? inView : play && inView;
  const words = text.split(" ");
  let i = 0;
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden>
          {w.split("").map((c) => {
            const idx = i++;
            return (
              <span key={idx} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "115%", rotate: 6 }}
                  animate={show ? { y: "0%", rotate: 0 } : {}}
                  transition={{ duration: 0.9, ease, delay: delay + idx * stagger }}
                >
                  {c}
                </motion.span>
              </span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/* ---------- Line fade-up ---------- */
export function FadeUp({ children, delay = 0, className = "", y = 40 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Scroll-scrubbed word highlight ---------- */
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span style={{ opacity, y }} className="mr-[0.26em] inline-block">
      {children}
    </motion.span>
  );
}

export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

/* ---------- Animated counter ---------- */
export function Counter({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      {String(val).padStart(2, "0")}
      {suffix}
    </span>
  );
}

/* ---------- Marquee ---------- */
export function Marquee({ items, reverse = false, className = "", sep = "✦" }: { items: string[]; reverse?: boolean; className?: string; sep?: string }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6">{t}</span>
          <span className="text-[0.5em] opacity-70">{sep}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <div className={`flex ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}>
        {row}
        {row}
      </div>
    </div>
  );
}

/* ---------- Section label ---------- */
export function Label({ index, children, className = "" }: { index: string; children: ReactNode; className?: string }) {
  return (
    <FadeUp y={14} className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-mute ${className}`}>
      <span className="text-accent">({index})</span>
      <motion.span
        className="h-px w-10 origin-left bg-current opacity-40"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease, delay: 0.2 }}
      />
      {typeof children === "string" ? <Scramble text={children} /> : <span>{children}</span>}
    </FadeUp>
  );
}

/* ---------- 3D tilt card with spotlight ---------- */
export function Tilt({ children, className = "", max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 });
  const sry = useSpring(ry, { stiffness: 150, damping: 15 });
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * max * 2);
        rx.set(-(py - 0.5) * max * 2);
        setSpot({ x: px * 100, y: py * 100 });
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      className={`group relative ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%)` }}
      />
      {children}
    </motion.div>
  );
}

/* ---------- Rotating circular text badge ---------- */
export function RotatingBadge({ text, children, size = 160, className = "" }: { text: string; children?: ReactNode; size?: number; className?: string }) {
  return (
    <div className={`relative grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow">
        <defs>
          <path id="circlePath" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-bone font-mono text-[13.5px] uppercase tracking-[0.32em]">
          <textPath href="#circlePath">{text}</textPath>
        </text>
      </svg>
      {children}
    </div>
  );
}

/* ---------- Custom cursor ---------- */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 180, damping: 20, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 180, damping: 20, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    const move = (e: globalThis.MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
    };
    const over = (e: globalThis.MouseEvent) => {
      const t = e.target as HTMLElement;
      const l = t.closest<HTMLElement>("[data-cursor]");
      setLabel(l ? l.dataset.cursor ?? null : null);
      setHover(!!t.closest("a, button, input, textarea, [data-hover]"));
    };
    const leave = () => setHidden(true);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.removeEventListener("mouseleave", leave);
      document.body.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const size = label ? 96 : hover ? 56 : 34;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ x, y, opacity: hidden || label ? 0 : 1 }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[199] grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        style={{ x: rx, y: ry, opacity: hidden ? 0 : 1 }}
        animate={{
          width: size,
          height: size,
          backgroundColor: label ? "var(--accent)" : "rgba(0,0,0,0)",
          borderColor: label ? "var(--accent)" : hover ? "var(--accent)" : "rgba(236,235,230,0.35)",
        }}
        transition={{ duration: 0.35, ease }}
      >
        <div className="absolute inset-0 rounded-full border" style={{ borderColor: "inherit" }} />
        {label && <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink">{label}</span>}
      </motion.div>
    </>
  );
}

/* ---------- Brand icons ---------- */
export const GithubIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);
export const InstagramIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const WhatsappIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2a9.93 9.93 0 0 0-8.6 14.88L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.47 0 9.92-4.45 9.92-9.92a9.86 9.86 0 0 0-2.91-7.01Zm-7.01 15.26a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.25 8.25 0 1 1 6.99 3.86Zm4.52-6.18c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06a6.77 6.77 0 0 1-3.37-2.94c-.25-.44.25-.41.73-1.36.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.66.31 2.78 2.78 0 0 0-.87 2.07 4.84 4.84 0 0 0 1.01 2.56c.12.17 1.75 2.67 4.23 3.74 1.57.68 2.19.74 2.98.62.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
);

/* ---------- Image helper: takes all pics without bncc from nirob120.netlify.app ---------- */
export const NETLIFY_URL = "https://nirob120.netlify.app";

export const getImageUrl = (file: string) => {
  // All images except bncc come directly from nirob120.netlify.app
  if (file.toLowerCase().includes("bncc")) {
    return `/nirob/${file}`;
  }
  return `${NETLIFY_URL}/${file}`;
};

export const asset = (file: string) => getImageUrl(file);

export function SiteImage({
  file,
  alt,
  className = "",
  ...rest
}: { file: string; alt: string; className?: string } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "className">) {
  const isBncc = file.toLowerCase().includes("bncc");
  // Primary URL is directly nirob120.netlify.app for all photos, except bncc which is local
  const primary = isBncc ? `/nirob/${file}` : `${NETLIFY_URL}/${file}`;
  const [src, setSrc] = useState(primary);
  const [attempt, setAttempt] = useState(0);

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (attempt === 0) {
          // If primary fails, fallback to local /nirob/${file}
          setSrc(isBncc ? `/bncc.jpg` : `/nirob/${file}`);
          setAttempt(1);
        } else if (attempt === 1) {
          // Second fallback: root /${file}
          setSrc(isBncc ? `nirob/bncc.jpg` : `/${file}`);
          setAttempt(2);
        } else if (attempt === 2 && !isBncc) {
          // Third fallback: relative nirob/${file}
          setSrc(`nirob/${file}`);
          setAttempt(3);
        }
      }}
    />
  );
}

/* ---------- Chapter divider: number wipes in, rule draws across ---------- */
export function ChapterMark({
  index,
  title,
  meta,
  tone = "dark",
  className = "",
}: {
  index: string;
  title: string;
  meta?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <div className={`relative z-10 mx-auto w-full max-w-[1600px] px-5 md:px-10 ${className}`}>
      <div className="flex items-end justify-between gap-6 border-t pt-4" style={{ borderColor: light ? "rgba(10,10,10,.18)" : "rgba(244,242,236,.14)" }}>
        <div className="flex items-end gap-4 md:gap-6">
          <span className={`font-display text-5xl font-extrabold leading-none tracking-tight md:text-7xl ${light ? "text-ink/15" : "text-bone/15"}`}>{index}</span>
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "110%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.9, ease }}
              className={`font-mono text-[10px] uppercase tracking-[0.28em] md:text-[11px] ${light ? "text-ink/60" : "text-mute"}`}
            >
              {title}
            </motion.p>
          </div>
        </div>
        {meta && <span className={`hidden font-mono text-[10px] uppercase tracking-[0.22em] sm:block ${light ? "text-ink/40" : "text-mute/70"}`}>{meta}</span>}
      </div>
    </div>
  );
}
