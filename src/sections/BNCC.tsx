import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ArrowUpRight, Crosshair, X } from "lucide-react";
import { profile } from "../data";
import { ease } from "../lib";
import { FadeUp, Label, Magnetic, Scramble, SiteImage } from "../components/ui";

const COMMANDS = ["ATTENTION", "STAND AT EASE", "SALUTE", "DISMISS"];
const grades = [
  { name: "Inspection", filter: "saturate(1.05) contrast(1.05)" },
  { name: "Parade", filter: "grayscale(1) contrast(1.15) brightness(1.05)" },
  { name: "Service", filter: "sepia(.45) saturate(1.3)" },
  { name: "Pride", filter: "hue-rotate(-12deg) saturate(1.2)" },
];

/* Official cadet photo: loads straight from nirob120.netlify.app; if it is not
   published yet an art-directed record panel is shown instead of a stock image. */
function CadetPhoto({ className = "", alt = "Nirob, BNCC cadet" }: { className?: string; alt?: string }) {
  const [src, setSrc] = useState("/nirob/bncc.jpg");
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-[42%_45%]"
        onError={() => {
          if (src === "/nirob/bncc.jpg") setSrc("/bncc.jpg");
          else if (src === "/bncc.jpg") setSrc("nirob/bncc.jpg");
        }}
      />
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
      className="relative w-[300px] overflow-hidden rounded-2xl border border-white/20 p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]"
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
        <div className="flex gap-[2px]">
          {Array.from({ length: 32 }).map((_, i) => (
            <span key={i} className="block bg-bone/70" style={{ width: i % 3 ? 1 : 2.5, height: i % 4 ? 14 : 20 }} />
          ))}
        </div>
        <span className="font-serif text-lg italic text-[#d8d6cf]">Nirob.</span>
      </div>
    </motion.div>
  );
}

export function BNCC() {
  const ref = useRef<HTMLElement>(null);
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
  const cornerScale = useTransform(p, [0, 0.45, 1], [1.5, 1, 0.96]);
  const [cmd, setCmd] = useState(0);
  const [grade, setGrade] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  useMotionValueEvent(p, "change", (v) => {
    const i = Math.min(COMMANDS.length - 1, Math.max(0, Math.floor((v - 0.06) * 4.3)));
    if (i !== cmd) setCmd(i);
  });

  return (
    <>
      <section id="bncc" ref={ref} className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* photo */}
          <motion.div style={{ clipPath: clip }} className="absolute inset-0 will-change-[clip-path]">
            <motion.div style={{ scale: imgScale, y: imgY, filter: grades[grade].filter, transition: "filter .8s ease" }} className="absolute inset-[-6%]">
              <CadetPhoto className="h-full w-full" />
            </motion.div>

            {/* RGB-split glitch slices */}
            <motion.div style={{ x: split }} className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen [clip-path:inset(31%_0_58%_0)]">
              <CadetPhoto className="h-full w-full" alt="" />
            </motion.div>
            <motion.div style={{ x: useTransform(split, (v) => -v * 0.7) }} className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen [clip-path:inset(62%_0_27%_0)]">
              <CadetPhoto className="h-full w-full" alt="" />
            </motion.div>

            <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/40" />
            <motion.div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-ink/50" style={{ opacity: shade }} />

            {/* scan line */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#00e676]/25 to-transparent"
              animate={{ y: ["-10%", "110%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* opening cue */}
          <motion.div style={{ opacity: useTransform(p, [0, 0.16, 0.24], [1, 1, 0]) }} className="pointer-events-none absolute inset-x-0 top-[60%] z-10 flex flex-col items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#00e676]">Scroll to open frame</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="h-6 w-px bg-[#00e676]/80" />
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
            <div className="absolute right-3 top-3 hidden font-mono text-[9px] uppercase tracking-[0.2em] text-bone/70 md:right-20 md:top-6 md:block">
              f/1.8 · 1/500 · ISO 100
            </div>
            <div className="absolute right-3 top-12 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-bone/60 md:right-20 md:top-14 md:flex">
              <span className="rounded-full border border-white/20 px-2 py-0.5">Sylhet · BD</span>
              <span className="rounded-full border border-[#00e676]/40 px-2 py-0.5 text-[#00e676]">BNCC</span>
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
          <motion.div style={{ opacity: hudOpacity, y: hudY }} className="absolute left-4 top-20 z-20 w-[min(300px,62vw)] rounded-2xl border border-white/15 bg-ink/55 p-4 backdrop-blur-md md:left-10 md:top-28 md:w-[340px] md:p-5">
            <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.2em]">
              <span className="text-[#00e676]">04 / Beyond the code</span>
              <span className="text-bone/40">Cadet</span>
            </div>
            <h3 className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.9] tracking-tight md:text-5xl">
              BNCC
              <br />
              <span className="text-stroke">Cadet</span>
            </h3>
            <p className="mt-2.5 text-xs leading-relaxed text-bone/70 md:text-[13px]">Proudly serving as a cadet of the Bangladesh National Cadet Corps at JCPSC.</p>
            <div className="mt-3 flex items-center gap-1.5">
              {["Service", "Discipline", "Pride"].map((t) => (
                <span key={t} className="rounded-full border border-white/15 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.14em] text-bone/60">{t}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-bone/40">Drill 01 / Inspection</span>
              <button onClick={() => setOpen(true)} aria-label="View full frame" className="group grid h-9 w-9 place-items-center rounded-full border border-white/25 transition-colors hover:border-[#00e676] hover:bg-[#00e676] hover:text-ink">
                <ArrowUpRight size={14} className="transition-transform group-hover:rotate-45" />
              </button>
            </div>
          </motion.div>

          {/* ID card (desktop) */}
          <motion.div style={{ opacity: hudOpacity }} className="absolute bottom-32 right-8 z-10 hidden lg:block">
            <motion.div initial={{ rotate: 7, y: 60, opacity: 0 }} whileInView={{ rotate: 4, y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease }}>
              <HologramCard />
            </motion.div>
          </motion.div>

          {/* command + facts */}
          <motion.div style={{ opacity: hudOpacity, y: hudY }} id="bncc-hud" className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink via-ink/50 to-transparent px-4 pb-6 pt-16 pr-24 md:px-10 md:pb-8 lg:pr-28">
            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-bone/70 md:text-[9px]">Drill command</p>
                <div className="mt-1 flex items-center gap-3 overflow-hidden">
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
                      {COMMANDS[cmd]}
                    </motion.p>
                  </AnimatePresence>
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
            <div className="mt-8 flex flex-wrap gap-3">
              {["Bangladesh National Cadet Corps", "JCPSC · Class 10", "Sylhet, Bangladesh"].map((t) => (
                <span key={t} className="rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-bone/70">{t}</span>
              ))}
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
              {[
                ["01", "Service", "Showing up for the team before showing up for myself."],
                ["02", "Discipline", "Drill, study, code — the same standard every single day."],
                ["03", "Pride", "Representing my school, my family and my hometown."],
              ].map(([n, t, d]) => (
                <div key={n} className="group relative overflow-hidden rounded-2xl border border-white/10 p-5">
                  <span className="absolute inset-0 origin-left scale-x-0 bg-[#1c1c1a] transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="relative flex items-start gap-4">
                    <span className="font-mono text-[10px] text-[#00e676]">{n}</span>
                    <div>
                      <p className="font-display text-lg font-bold uppercase">{t}</p>
                      <p className="mt-1 text-sm text-mute">{d}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* film strip */}
        <div className="mt-20">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
              <Scramble text="FILM STRIP / BNCC 2026" />
            </p>
            <Label index="+" className="!text-mute">Click a frame to grade</Label>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {[...grades, ...grades].map((g, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                onClick={() => setGrade(i % grades.length)}
                className={`group relative w-[42vw] shrink-0 overflow-hidden rounded-lg border transition-colors sm:w-52 ${grade === i % grades.length ? "border-[#00e676]" : "border-white/10 hover:border-white/30"}`}
                data-hover
              >
                <CadetPhoto className="h-28 w-full sm:h-32" alt="" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-ink/90 to-transparent p-2">
                  <p className={`font-mono text-[8px] uppercase tracking-[0.2em] ${grade === i % grades.length ? "text-[#00e676]" : "text-bone/70"}`}>{g.name}</p>
                  {grade === i % grades.length && <span className="h-1.5 w-1.5 rounded-full bg-[#00e676]" />}
                </div>
                <div className="pointer-events-none absolute inset-0 grid grid-cols-8 gap-[1px] opacity-40">
                  {Array.from({ length: 16 }).map((_, k) => (
                    <span key={k} className="border border-white/5" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
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
              initial={{ scale: 0.88, rotateX: -12, y: 40 }}
              animate={{ scale: 1, rotateX: 0, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.7, ease }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[86svh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,.8)]"
              style={{ transformPerspective: 1200 }}
            >
              <SiteImage file="bncc.jpg" alt="Nirob BNCC cadet inspection, full frame" className="max-h-[76svh] w-full object-cover" style={{ filter: grades[grade].filter }} />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-ink to-transparent p-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#00e676]">BNCC · Inspection day</p>
                  <p className="font-serif text-2xl italic">“Service before self.”</p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-bone/50">Grade / {grades[grade].name}</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close photo" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ink/70 backdrop-blur transition-colors hover:bg-accent hover:text-ink">
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
