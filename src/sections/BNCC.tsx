import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Expand,
  Eye,
  EyeOff,
  Flag,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Shield,
  X,
} from "lucide-react";
import { profile } from "../data";
import { ease, lockScroll, pad, scrollToY } from "../lib";
import { FadeUp, Label, Magnetic, Scramble, SiteImage } from "../components/ui";

const GREEN = "#00e676";

/* Drill sequence — `at` is the scroll progress where each command lands. */
const COMMANDS = [
  { name: "ATTENTION", cue: "Eyes front · heels together · ready for inspection", at: 0.18 },
  { name: "STAND AT EASE", cue: "Feet apart · hands behind · stay sharp, stay still", at: 0.42 },
  { name: "SALUTE", cue: "One motion · respect for the uniform and what it stands for", at: 0.66 },
  { name: "DISMISS", cue: "Drill over · the standard carries into the classroom", at: 0.9 },
];

const GRADES = [
  { name: "Inspection", desc: "Original colour, lifted a touch", filter: "saturate(1.05) contrast(1.05)" },
  { name: "Parade", desc: "Black & white, hard contrast", filter: "grayscale(1) contrast(1.15) brightness(1.05)" },
  { name: "Service", desc: "Warm sepia, like a printed record", filter: "sepia(.45) saturate(1.3)" },
  { name: "Pride", desc: "Vivid — the reds & greens pushed", filter: "hue-rotate(-12deg) saturate(1.2)" },
];

/* Markers on the photo (x/y in % of the 2048×1365 frame). */
const NOTES = [
  { x: 9.5, y: 13, label: "The cadet", detail: "Red beret, eyes front" },
  { x: 17, y: 44, label: "BNCC crest", detail: "Worn on the sleeve" },
  { x: 41, y: 79, label: "The handshake", detail: "Greeting the inspecting officer" },
  { x: 80, y: 24, label: "Inspecting officer", detail: "Reviewing the line" },
];

const VALUES = [
  { n: "01", icon: HeartHandshake, title: "Service", desc: "Showing up for the team before showing up for myself." },
  { n: "02", icon: Crosshair, title: "Discipline", desc: "Drill, study, code — the same standard every single day." },
  { n: "03", icon: Flag, title: "Pride", desc: "Representing my school, my family and my hometown." },
];

const FILE_FACTS = [
  { icon: Shield, label: "Corps", value: "BNCC" },
  { icon: GraduationCap, label: "Unit", value: "JCPSC · Class 10" },
  { icon: MapPin, label: "Base", value: "Sylhet, Bangladesh" },
  { icon: Award, label: "Values", value: "Service · Discipline · Pride" },
];

const FALLBACKS = ["/nirob/bncc.jpg", "/bncc.jpg", "nirob/bncc.jpg"];

/* The cadet photo (public/nirob/bncc.jpg, 2048×1365).
   Focal point is tuned for this frame: cadet on the left, handshake centre —
   pulled left on narrow screens so neither is cropped away. */
function CadetPhoto({
  className = "",
  alt = "Nirob, BNCC cadet, shaking hands with the inspecting officer",
  filter,
  lazy = false,
}: {
  className?: string;
  alt?: string;
  filter?: string;
  lazy?: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={FALLBACKS[Math.min(attempt, FALLBACKS.length - 1)]}
        alt={alt}
        width={2048}
        height={1365}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        draggable={false}
        style={filter ? { filter, transition: "filter .6s ease" } : undefined}
        className="absolute inset-0 h-full w-full object-cover object-[30%_42%] sm:object-[36%_44%] lg:object-[42%_45%]"
        onError={() => setAttempt((a) => Math.min(a + 1, FALLBACKS.length - 1))}
      />
    </div>
  );
}

/* Numbered markers over the photo — only exact on 3:2 (uncropped) frames. */
function PhotoNotes({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-label="Photo notes">
      {NOTES.map((n, i) => {
        const align = n.x < 22 ? "left-0" : n.x > 72 ? "right-0" : "left-1/2 -translate-x-1/2";
        const vAlign = n.y > 70 ? "bottom-full mb-1" : "top-full mt-1";
        return (
          <div key={n.label} className="group pointer-events-auto absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
            <button
              type="button"
              aria-label={`${n.label}: ${n.detail}`}
              className="relative grid h-6 w-6 place-items-center rounded-full border border-white/50 bg-ink/60 font-mono text-[9px] text-bone backdrop-blur-sm transition-colors hover:border-[#00e676] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676]"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-[#00e676]/30" />
              <span className="relative">{i + 1}</span>
            </button>
            <span
              className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-white/15 bg-ink/85 px-2.5 py-1.5 opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${align} ${vAlign}`}
            >
              <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-[#00e676]">{n.label}</span>
              <span className="block text-[11px] text-bone/85">{n.detail}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HologramCard() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sy = useSpring(ry, { stiffness: 150, damping: 18 });
  const [shine, setShine] = useState({ x: 50, y: 50 });

  return (
    <motion.div
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 26);
        rx.set(-(py - 0.5) * 26);
        setShine({ x: px * 100, y: py * 100 });
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      className="relative w-[min(300px,86vw)] overflow-hidden rounded-2xl border border-white/20 p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]"
      data-cursor="Salute"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b1b19] via-[#111110] to-[#080808]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay"
        style={{ background: `radial-gradient(240px circle at ${shine.x}% ${shine.y}%, #e6e4dd55, #f4f2ec44 45%, transparent 70%)` }}
      />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#e53935] via-[#fbc02d] to-[#2e7d32]" />
      <div className="relative flex items-center gap-3 border-b border-white/10 pb-3">
        <SiteImage file="hii.png" alt="Nirob crest" className="h-11 w-11 rounded-full object-cover ring-1 ring-white/30" loading="lazy" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-bone/50">Bangladesh National Cadet Corps</p>
          <p className="font-display text-base font-extrabold leading-tight">BNCC CADET</p>
        </div>
        <Crosshair size={18} className="text-[#00e676]" />
      </div>
      <div className="relative mt-3 space-y-1.5 font-mono text-[9px] uppercase tracking-[0.14em]">
        {[
          ["Name", profile.fullName],
          ["Unit", "JCPSC · Class 10"],
          ["Role", "Cadet"],
          ["Location", "Sylhet, BD"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-white/[0.06] pb-1">
            <span className="text-bone/40">{k}</span>
            <span className="truncate text-right text-bone/90">{v}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-3 flex items-end justify-between">
        <div>
          <div className="flex gap-[2px]">
            {Array.from({ length: 32 }).map((_, i) => (
              <span key={i} className="block bg-bone/70" style={{ width: i % 3 ? 1 : 2.5, height: i % 4 ? 14 : 20 }} />
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#00e676]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00e676]" /> On parade
          </p>
        </div>
        <span className="font-serif text-lg italic text-[#d8d6cf]">Nirob.</span>
      </div>
    </motion.div>
  );
}

export function BNCC() {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.0005 });

  const clip = useTransform(p, [0, 0.42, 0.82], [
    "inset(41% 35% 41% 35% round 18px)",
    "inset(10% 8% 10% 8% round 26px)",
    "inset(0% 0% 0% 0% round 0px)",
  ]);
  const imgScale = useTransform(p, [0, 0.55, 1], [1.45, 1.04, 1.16]);
  const imgY = useTransform(p, [0, 1], ["-7%", "7%"]);
  const shade = useTransform(p, [0, 0.55, 1], [0.72, 0.28, 0.62]);
  const bigY = useTransform(p, [0, 1], ["38%", "-38%"]);
  const bigOpacity = useTransform(p, [0, 0.35, 1], [0, 1, 0.6]);
  const hudOpacity = useTransform(p, [0.32, 0.5], [0, 1]);
  const hudY = useTransform(p, [0.32, 0.5], [30, 0]);
  const split = useTransform(p, [0, 0.5, 1], [70, 0, -70]);
  const splitRev = useTransform(split, (v) => -v * 0.7);
  const cornerScale = useTransform(p, [0, 0.45, 1], [1.5, 1, 0.96]);
  const cueOpacity = useTransform(p, [0, 0.16, 0.24], [1, 1, 0]);
  /* Rendered as a MotionValue child — the % ticks without re-rendering. */
  const framePct = useTransform(p, (v) => `Frame ${pad(Math.round(Math.min(100, Math.max(0, v * 100))), 3)}%`);

  const [cmd, setCmd] = useState(0);
  const [hudOn, setHudOn] = useState(false);
  const [grade, setGrade] = useState(0);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(false);

  useMotionValueEvent(p, "change", (v) => {
    const i = Math.min(COMMANDS.length - 1, Math.max(0, Math.floor((v - 0.06) * 4.3)));
    setCmd((prev) => (i === prev ? prev : i));
    const on = v >= 0.3;
    setHudOn((prev) => (on === prev ? prev : on));
  });

  /* Lightbox: lock scroll, Esc closes, ←/→ cycle the grade. */
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") setGrade((g) => (g + 1) % GRADES.length);
      else if (e.key === "ArrowLeft") setGrade((g) => (g - 1 + GRADES.length) % GRADES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [open]);

  const goToCommand = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(el.offsetHeight - window.innerHeight, 0);
    scrollToY(top + COMMANDS[i].at * travel);
  };

  const activeGrade = GRADES[grade];

  return (
    <>
      <section id="bncc" ref={ref} aria-label="BNCC cadet" className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* photo */}
          <motion.div style={{ clipPath: clip }} className="absolute inset-0 will-change-[clip-path]">
            <motion.div style={{ scale: imgScale, y: imgY }} className="absolute inset-[-6%]">
              <CadetPhoto className="h-full w-full" filter={activeGrade.filter} />
            </motion.div>

            {/* RGB-split glitch slices (off for reduced motion) */}
            {!reduce && (
              <>
                <motion.div style={{ x: split }} className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen [clip-path:inset(31%_0_58%_0)]">
                  <CadetPhoto className="h-full w-full" alt="" filter={activeGrade.filter} />
                </motion.div>
                <motion.div style={{ x: splitRev }} className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen [clip-path:inset(62%_0_27%_0)]">
                  <CadetPhoto className="h-full w-full" alt="" filter={activeGrade.filter} />
                </motion.div>
              </>
            )}

            <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/40" />
            <motion.div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-ink/50" style={{ opacity: shade }} />

            {/* scan line */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#00e676]/25 to-transparent"
              animate={reduce ? { y: "38%" } : { y: ["-10%", "110%"] }}
              transition={reduce ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* opening cue */}
          <motion.div style={{ opacity: cueOpacity }} className="pointer-events-none absolute inset-x-0 top-[60%] z-10 flex flex-col items-center gap-2">
            <span className="rounded-full border border-[#00e676]/30 bg-ink/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.4em] text-[#00e676] backdrop-blur-sm">Scroll to open frame</span>
            <motion.span animate={reduce ? undefined : { y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="h-6 w-px bg-[#00e676]/80" />
            <span className="relative h-px w-32 overflow-hidden bg-white/15">
              <motion.span style={{ scaleX: p }} className="absolute inset-0 origin-left bg-[#00e676]" />
            </span>
          </motion.div>

          {/* corner HUD */}
          <motion.div style={{ opacity: hudOpacity, scale: cornerScale }} className="pointer-events-none absolute inset-5 md:inset-8">
            {[
              "left-0 top-0 border-l border-t",
              "right-0 top-0 border-r border-t",
              "left-0 bottom-0 border-l border-b",
              "right-0 bottom-0 border-r border-b",
            ].map((c, i) => (
              <motion.span
                key={i}
                className={`absolute h-10 w-10 border-bone/60 md:h-16 md:w-16 ${c}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }}
              />
            ))}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-bone/40">
              <Crosshair size={28} />
            </div>
            <div className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/70 md:left-20 md:top-6">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> REC · 24.93°N 91.98°E
            </div>
            <div className="absolute right-3 top-3 hidden text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-bone/70 md:right-20 md:top-6 md:block">
              BNCC.JPG · 2048×1365
              <motion.span className="block text-[#00e676]">{framePct}</motion.span>
            </div>
            <div className="absolute right-3 top-14 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-bone/60 md:right-20 md:top-[4.5rem] md:flex">
              <span className="rounded-full border border-white/20 px-2 py-0.5">Sylhet · BD</span>
              <span className="rounded-full border border-[#00e676]/40 px-2 py-0.5 text-[#00e676]">Grade / {activeGrade.name}</span>
            </div>
          </motion.div>

          {/* big display type */}
          <motion.div style={{ y: bigY, opacity: bigOpacity }} className="pointer-events-none absolute inset-x-0 top-[45%] z-[5] -translate-y-1/2 px-4 text-center">
            <h2 className="font-display text-[16vw] font-extrabold uppercase leading-[0.8] tracking-[-0.03em] text-transparent [-webkit-text-stroke:1.5px_rgba(236,235,230,0.75)] [filter:drop-shadow(0_6px_24px_rgba(0,0,0,0.7))] md:text-[11vw] md:[-webkit-text-stroke:2px_rgba(236,235,230,0.8)]">
              SERVICE
            </h2>
            <div className="mx-auto mt-2 h-px w-24 bg-[#00e676]/70 md:w-40" />
            <p className="mx-auto mt-3 max-w-[16rem] font-serif text-xl italic leading-tight text-bone sm:max-w-md sm:text-3xl md:text-4xl" style={{ textShadow: "0 2px 30px #000" }}>
              Discipline, in and out of uniform.
            </p>
          </motion.div>

          {/* label */}
          <motion.div
            style={{ opacity: hudOpacity, y: hudY }}
            className={`absolute left-4 top-20 z-20 w-[min(300px,62vw)] rounded-2xl border border-white/15 bg-ink/55 p-4 backdrop-blur-md md:left-10 md:top-28 md:w-[340px] md:p-5 ${hudOn ? "" : "pointer-events-none"}`}
          >
            <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.2em]">
              <span className="text-[#00e676]">04 / Beyond the code</span>
              <span className="flex items-center gap-1.5 text-bone/50">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00e676]" /> On parade
              </span>
            </div>
            <h3 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.9] tracking-tight md:text-5xl">
              BNCC
              <br />
              <span className="text-stroke">Cadet</span>
            </h3>
            <p className="mt-2.5 text-xs leading-relaxed text-bone/70 md:text-[13px]">Proudly serving as a cadet of the Bangladesh National Cadet Corps at JCPSC — this is inspection day.</p>
            <div className="mt-3 flex items-center gap-1.5">
              {["Service", "Discipline", "Pride"].map((t) => (
                <span key={t} className="rounded-full border border-white/15 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.14em] text-bone/60">{t}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-bone/40">Drill 01 / Inspection</span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.18em] transition-colors hover:border-[#00e676] hover:bg-[#00e676] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676]"
              >
                Full frame
                <Expand size={12} className="transition-transform group-hover:scale-125" />
              </button>
            </div>
          </motion.div>

          {/* ID card (desktop) */}
          <motion.div style={{ opacity: hudOpacity }} className={`absolute bottom-32 right-8 z-10 hidden lg:block ${hudOn ? "" : "pointer-events-none"}`}>
            <motion.div initial={{ rotate: 7, y: 60, opacity: 0 }} whileInView={{ rotate: 4, y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease }}>
              <HologramCard />
            </motion.div>
          </motion.div>

          {/* command console */}
          <motion.div
            style={{ opacity: hudOpacity, y: hudY }}
            id="bncc-hud"
            className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink via-ink/50 to-transparent px-4 pb-6 pt-16 pr-24 md:px-10 md:pb-8 lg:pr-28 ${hudOn ? "" : "pointer-events-none"}`}
          >
            <div className="relative mb-4 h-px overflow-hidden bg-white/10">
              <motion.span style={{ scaleX: p }} className="absolute inset-0 origin-left bg-[#00e676]" />
            </div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-bone/70 md:text-[9px]">
                  Drill command · <span className="text-[#00e676]">{pad(cmd + 1)} / 04</span>
                </p>
                <div className="mt-1 flex items-center gap-3 overflow-hidden" aria-live="polite">
                  <span className="h-8 w-[2px] shrink-0 bg-[#00e676] md:h-10" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={cmd}
                      initial={{ y: 44, opacity: 0, rotateX: -75 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -44, opacity: 0, rotateX: 75 }}
                      transition={{ duration: 0.5, ease }}
                      className="whitespace-nowrap font-display text-[5.6vw] font-extrabold uppercase tracking-tight text-bone sm:text-3xl md:text-5xl"
                    >
                      {COMMANDS[cmd].name}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`cue-${cmd}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease }}
                    className="mt-1.5 truncate text-[11px] text-bone/60 md:text-sm"
                  >
                    {COMMANDS[cmd].cue}
                  </motion.p>
                </AnimatePresence>
                {/* jump to a command */}
                <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Drill commands">
                  {COMMANDS.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => goToCommand(i)}
                      aria-pressed={cmd === i}
                      className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676] ${
                        cmd === i
                          ? "border-transparent bg-[#00e676] font-bold text-ink"
                          : "border-white/20 text-bone/65 hover:border-[#00e676]/60 hover:text-bone"
                      }`}
                    >
                      {pad(i + 1)} · {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden flex-col items-end gap-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-bone/60 sm:flex">
                {["Service", "Discipline", "Pride"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-[#00e676]" />{t}</span>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* after the reveal */}
      <div className="relative mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="grid gap-12 border-t border-white/10 pt-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <FadeUp>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#00e676]">( Cadet record )</p>
            <p className="mt-5 font-display text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl">
              “I always try to be a good student and work hard to achieve my goals — uniform on or off.”
            </p>
            {/* cadet file */}
            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-3">
              {FILE_FACTS.map((f) => (
                <div key={f.label} className="group rounded-xl border border-white/10 p-3.5 transition-colors hover:border-[#00e676]/50">
                  <dt className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-mute">
                    <f.icon size={13} className="text-[#00e676]" /> {f.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-bone">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Bangladesh National Cadet Corps", "JCPSC · Class 10", "Sylhet, Bangladesh"].map((t) => (
                <span key={t} className="rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-bone/70">{t}</span>
              ))}
            </div>
            {/* the ID card, now also on phones & tablets */}
            <div className="mt-10 flex justify-center sm:justify-start lg:hidden">
              <HologramCard />
            </div>
            <Magnetic className="mt-8">
              <a href="#beyond" className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition-colors group-hover:border-[#00e676] group-hover:text-[#00e676]"><ArrowRight size={16} /></span>
                Beyond the uniform
              </a>
            </Magnetic>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-mute">Field notes</p>
            <div className="grid gap-3">
              {VALUES.map((v) => (
                <div key={v.n} className="group relative overflow-hidden rounded-2xl border border-white/10 p-5 transition-colors hover:border-[#00e676]/40">
                  <span className="absolute inset-0 origin-left scale-x-0 bg-[#1c1c1a] transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="relative flex items-start gap-4">
                    <span className="font-mono text-[10px] text-[#00e676]">{v.n}</span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-[#00e676] transition-colors group-hover:border-[#00e676]/60 group-hover:bg-[#00e676]/10">
                      <v.icon size={16} />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold uppercase">{v.title}</p>
                      <p className="mt-1 text-sm text-mute">{v.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* live grade preview */}
        <div className="mt-20">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
              <Scramble text="FILM STRIP / BNCC 2026" />
            </p>
            <Label index="+" className="!text-mute">Pick a grade — the preview updates live</Label>
          </div>

          <FadeUp>
            <figure className="relative overflow-hidden rounded-2xl border border-white/12 shadow-[0_40px_100px_-40px_rgba(0,0,0,.9)]">
              <CadetPhoto className="aspect-[3/2] w-full bg-panel" filter={activeGrade.filter} lazy />
              <PhotoNotes visible={notes} />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="rounded-full border border-white/20 bg-ink/60 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-bone/85 backdrop-blur">
                  Grade / <span className="text-[#00e676]">{activeGrade.name}</span>
                </span>
                <span className="hidden rounded-full border border-white/15 bg-ink/50 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-bone/60 backdrop-blur sm:block">
                  {activeGrade.desc}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNotes((s) => !s)}
                aria-pressed={notes}
                className={`absolute right-4 top-4 flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] backdrop-blur transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676] ${
                  notes ? "border-[#00e676] bg-[#00e676] text-ink" : "border-white/25 bg-ink/55 text-bone/85 hover:border-[#00e676]/70"
                }`}
              >
                {notes ? <EyeOff size={12} /> : <Eye size={12} />} Photo notes
              </button>
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-4 pt-14 md:p-5 md:pt-16">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#00e676]">BNCC · Inspection day</p>
                  <p className="font-serif text-xl italic text-bone md:text-2xl">“Service before self.”</p>
                  {notes && <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-bone/55">Tap a marker to read the frame</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="group flex items-center gap-2 rounded-full bg-bone px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-[#00e676] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00e676]"
                >
                  Open full frame
                  <Expand size={13} className="transition-transform group-hover:scale-125" />
                </button>
              </figcaption>
            </figure>
          </FadeUp>

          {/* grade frames — each thumbnail previews its own grade */}
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Photo grades">
            {GRADES.map((g, i) => {
              const active = grade === i;
              return (
                <motion.button
                  key={g.name}
                  type="button"
                  initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                  whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease, delay: i * 0.06 }}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGrade(i)}
                  aria-pressed={active}
                  aria-label={`Apply the ${g.name} grade — ${g.desc}`}
                  className={`group relative overflow-hidden rounded-xl border text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676] ${
                    active ? "border-[#00e676] shadow-[0_14px_40px_-14px_rgba(0,230,118,.45)]" : "border-white/10 hover:border-white/35"
                  }`}
                  data-hover
                >
                  <CadetPhoto className="pointer-events-none h-28 w-full sm:h-32" alt="" filter={g.filter} lazy />
                  <span className="absolute left-2 top-2 rounded bg-ink/60 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.18em] text-bone/75 backdrop-blur">F-{pad(i + 1)}</span>
                  {active && (
                    <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#00e676] text-ink">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-ink/90 to-transparent p-2 pt-6">
                    <span className={`block font-mono text-[9px] uppercase tracking-[0.2em] ${active ? "text-[#00e676]" : "text-bone/80"}`}>{g.name}</span>
                    <span className="block truncate text-[10px] text-bone/55">{g.desc}</span>
                  </span>
                  <span className="pointer-events-none absolute inset-0 grid grid-cols-8 gap-[1px] opacity-40">
                    {Array.from({ length: 16 }).map((_, k) => (
                      <span key={k} className="border border-white/5" />
                    ))}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-mute" aria-live="polite">
            Selected grade: <span style={{ color: GREEN }}>{activeGrade.name}</span> — {activeGrade.desc} · applies to the parade frame &amp; full-frame view
          </p>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[180] grid place-items-center bg-ink/90 p-4 backdrop-blur-md md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="BNCC cadet photo, full frame"
              initial={{ scale: 0.88, rotateX: -12, y: 40 }}
              animate={{ scale: 1, rotateX: 0, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.7, ease }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full overflow-hidden rounded-2xl border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,.8)]"
              style={{ transformPerspective: 1200, width: "min(64rem, 100%, 123svh)" }}
            >
              <CadetPhoto className="aspect-[2048/1365] w-full bg-panel" filter={activeGrade.filter} alt="Nirob BNCC cadet inspection, full frame" />
              <PhotoNotes visible={notes} />
              <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-ink via-ink/60 to-transparent p-5 pt-14">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#00e676]">BNCC · Inspection day</p>
                    <p className="font-serif text-2xl italic">“Service before self.”</p>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-bone/60">
                    Grade / {activeGrade.name} · {pad(grade + 1)} / 04
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGrade((g) => (g - 1 + GRADES.length) % GRADES.length)}
                    aria-label="Previous grade"
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/25 transition-colors hover:border-[#00e676] hover:text-[#00e676] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676]"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {GRADES.map((g, i) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setGrade(i)}
                      aria-pressed={grade === i}
                      className={`rounded-full border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676] ${
                        grade === i ? "border-transparent bg-[#00e676] font-bold text-ink" : "border-white/25 text-bone/75 hover:border-[#00e676]/70 hover:text-bone"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGrade((g) => (g + 1) % GRADES.length)}
                    aria-label="Next grade"
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/25 transition-colors hover:border-[#00e676] hover:text-[#00e676] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676]"
                  >
                    <ChevronRight size={15} />
                  </button>
                  <span className="ml-auto hidden font-mono text-[8px] uppercase tracking-[0.18em] text-bone/40 md:block">← → grades · Esc to close</span>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close photo"
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ink/70 backdrop-blur transition-colors hover:bg-[#00e676] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e676]"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
