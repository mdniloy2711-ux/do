import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ArrowUp, ArrowUpRight, Palette, Search, X } from "lucide-react";
import { accents, nav, profile } from "../data";
import { ease, easeInOut, lockScroll, scrollToId, sylhetTime, useNow } from "../lib";
import { GithubIcon, InstagramIcon, Magnetic, RollText, SiteImage, WhatsappIcon } from "./ui";

/* ================= PRELOADER ================= */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const img = new Image();
    img.src = "https://nirob120.netlify.app/yes.jpg";
    const c = animate(0, 100, {
      duration: 2.4,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => window.setTimeout(onDone, 350),
    });
    return () => c.stop();
  }, [onDone]);

  const words = ["Design", "Develop", "Animate", "Create", "Nirob"];
  const word = words[Math.min(words.length - 1, Math.floor(count / 21))];

  const skills = ["Design", "Develop", "Animate", "Create", "Nirob"];
  return (
    <motion.div className="fixed inset-0 z-[300]" initial="initial" animate="animate" exit="exit">
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="h-full flex-1 border-r border-white/[0.04] bg-[#080808]"
            variants={{ exit: { y: "-100%", transition: { duration: 0.9, ease: easeInOut, delay: 0.12 + i * 0.05 } } }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,.06),transparent_65%)]" />
      <div className="grain" style={{ opacity: 0.08 }} />

      <motion.div
        className="relative flex h-full flex-col justify-between p-6 md:p-10"
        variants={{ exit: { opacity: 0, y: -50, transition: { duration: 0.45, ease } } }}
      >
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
          <span className="text-bone">{profile.stylized}</span>
          <span className="hidden sm:block">Al Nasif MD Nirob — Portfolio</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "grayscale(1) blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "grayscale(0) blur(0px)" }}
            transition={{ duration: 1.2, ease }}
            className="relative"
          >
            <span className="absolute -inset-4 animate-spin-slow rounded-full border border-dashed border-white/20" />
            <span className="absolute -inset-8 rounded-full border border-white/5" />
            <SiteImage file="hii.png" alt="Nirob logo" className="h-24 w-24 rounded-full object-cover ring-1 ring-white/25 md:h-28 md:w-28" />
          </motion.div>

          <div className="text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-mute">Loading portfolio</p>
            <div className="mt-3 h-12 overflow-hidden md:h-16">
              <AnimatePresence mode="wait">
                <motion.p
                  key={word}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-110%" }}
                  transition={{ duration: 0.35, ease }}
                  className="font-serif text-4xl italic leading-none text-bone md:text-6xl"
                >
                  {word}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 flex gap-1.5">
            {skills.map((s, i) => (
              <span key={s} className={`h-1 w-10 rounded-full transition-colors duration-500 ${count > i * 20 ? "bg-bone" : "bg-white/15"}`} />
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-6 border-t border-white/10 pt-4">
          <div className="hidden font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-mute sm:block">
            Web Developer & Designer
            <br />
            <span className="text-bone/70">Sylhet, Bangladesh</span>
          </div>
          <div className="flex flex-1 items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Loading</span>
            <div className="h-px flex-1 bg-white/10">
              <div className="h-px bg-bone transition-[width] duration-150" style={{ width: `${count}%` }} />
            </div>
            <p className="font-display text-5xl font-extrabold leading-none tabular-nums text-bone md:text-7xl">
              {String(count).padStart(3, "0")}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================= SCROLL PROGRESS ================= */
export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed inset-x-0 top-0 z-[120] h-[2px] origin-left bg-accent" style={{ scaleX }} />;
}

/* ================= SCROLL SPINE ================= */
export function ScrollSpine() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });
  const [pct, setPct] = useState(0);
  useMotionValueEvent(smooth, "change", (v) => setPct(Math.round(v * 100)));
  return (
    <div className="fixed bottom-6 left-1/2 z-[95] hidden -translate-x-1/2 items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-mute lg:flex" aria-hidden>
      <span className="tabular-nums text-bone/70">{String(pct).padStart(2, "0")}</span>
      <div className="relative h-px w-40 bg-white/12">
        <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-bone/80" style={{ scaleX: smooth }} />
      </div>
      <span className="tabular-nums">100</span>
    </div>
  );
}

/* ================= HEADER ================= */
export function Header({ active, ready, onMenu, onPalette }: { active: string; ready: boolean; onMenu: () => void; onPalette: () => void }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const now = useNow();

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 400);
    setScrolled(v > 40);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: ready && !hidden ? 0 : -110 }}
      transition={{ duration: 0.7, ease }}
      className="fixed inset-x-0 top-0 z-[100] px-4 pt-4 md:px-8"
    >
      <div
        className={`mx-auto flex max-w-[1600px] items-center justify-between rounded-full px-3 py-2 transition-all duration-500 md:px-4 ${
          scrolled ? "border border-white/10 bg-ink/60 backdrop-blur-xl" : "border border-transparent"
        }`}
      >
        <button onClick={() => scrollToId("home")} className="group flex items-center gap-3" aria-label="Back to top">
          <SiteImage file="hii.png" alt="Nirob logo" className="h-10 w-10 rounded-full object-cover transition-transform duration-700 group-hover:rotate-[360deg]" />
          <span className="hidden font-display text-sm font-bold tracking-wide md:block">{profile.stylized}</span>
        </button>

        <nav className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-1 xl:flex">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollToId(n.id)}
              className={`relative rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                active === n.id ? "text-ink" : "text-bone/70 hover:text-bone"
              }`}
            >
              {active === n.id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden text-right font-mono text-[10px] uppercase leading-tight tracking-[0.18em] text-mute lg:block">
            <p>Sylhet, BD</p>
            <p className="tabular-nums text-bone">{sylhetTime(now)}</p>
          </div>
          <button
            onClick={onPalette}
            className="group hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-mute transition-colors hover:border-white/25 hover:text-bone sm:flex"
            aria-label="Open command palette"
          >
            <Search size={13} />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">Search</span>
            <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[9px] text-mute group-hover:text-bone">⌘K</kbd>
          </button>
          <Magnetic strength={0.4}>
            <button onClick={onMenu} className="group flex items-center gap-3 rounded-full border border-white/20 bg-bone py-1.5 pl-4 pr-1.5 text-ink transition-colors hover:bg-accent" aria-label="Open menu">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"><RollText>Menu</RollText></span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink">
                <span className="flex flex-col gap-1">
                  <span className="block h-[1.5px] w-3.5 bg-bone transition-transform duration-300 group-hover:translate-x-0.5" />
                  <span className="block h-[1.5px] w-3.5 bg-bone transition-transform duration-300 group-hover:-translate-x-0.5" />
                </span>
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </motion.header>
  );
}

/* ================= FULLSCREEN MENU ================= */
export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  useEffect(() => {
    lockScroll(open);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  const go = (id: string) => {
    onClose();
    window.setTimeout(() => scrollToId(id), 650);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] overflow-y-auto bg-[#f4f2ec] text-[#0a0a0a]"
          initial={{ clipPath: "circle(0% at calc(100% - 4rem) 2.6rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 4rem) 2.6rem)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 4rem) 2.6rem)" }}
          transition={{ duration: 0.9, ease: easeInOut }}
        >
          <div className="flex min-h-full flex-col px-5 pb-8 pt-5 md:px-10">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold">{profile.stylized}</span>
              <button onClick={onClose} className="group flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-bone">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em]"><RollText>Close</RollText></span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-bone text-ink transition-transform duration-500 group-hover:rotate-90">
                  <X size={16} />
                </span>
              </button>
            </div>

            <div className="mt-10 grid flex-1 gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-end">
              <nav className="flex flex-col">
                {nav.map((n, i) => (
                  <div key={n.id} className="overflow-hidden border-b border-ink/15">
                    <motion.button
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ duration: 0.8, ease, delay: 0.25 + i * 0.05 }}
                      onClick={() => go(n.id)}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      className="group flex w-full items-baseline gap-4 py-1 text-left md:gap-8"
                      style={{ opacity: hovered === null || hovered === i ? 1 : 0.35, transition: "opacity .4s" }}
                    >
                      <span className="w-8 font-mono text-xs">0{i + 1}</span>
                      <span className="font-display text-[13vw] font-extrabold uppercase leading-[0.95] tracking-tight transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-4 sm:text-6xl lg:text-[5.4vw]">
                        {n.id === "personal-info" ? "Personal" : n.label}
                      </span>
                      <ArrowUpRight className="ml-auto h-8 w-8 -rotate-45 opacity-0 transition-all duration-500 group-hover:rotate-0 group-hover:opacity-100 md:h-12 md:w-12" />
                    </motion.button>
                  </div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease }}
                className="space-y-8 pb-2 font-mono text-xs uppercase tracking-[0.15em]"
              >
                <div>
                  <p className="mb-2 opacity-60">Say hello</p>
                  <a href={`mailto:${profile.email}`} className="block break-all font-sans text-lg normal-case tracking-normal underline-offset-4 hover:underline md:text-xl">{profile.email}</a>
                  <a href={profile.phoneHref} className="mt-1 block font-sans text-lg tracking-normal hover:underline md:text-xl">{profile.phone}</a>
                </div>
                <div>
                  <p className="mb-3 opacity-60">Socials</p>
                  <div className="flex gap-3">
                    {[
                      { href: profile.github, icon: <GithubIcon />, label: "GitHub" },
                      { href: profile.instagram, icon: <InstagramIcon />, label: "Instagram" },
                      { href: profile.whatsapp, icon: <WhatsappIcon />, label: "WhatsApp" },
                    ].map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="grid h-12 w-12 place-items-center rounded-full border border-ink/25 transition-colors hover:bg-ink hover:text-accent">
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
                <p className="opacity-60">{profile.location}</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= ACCENT DOCK ================= */
export function AccentDock() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => localStorage.getItem("nirob-accent-v2") || accents[0].value);
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", current);
    localStorage.setItem("nirob-accent-v2", current);
  }, [current]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change accent color"
        aria-expanded={open}
        className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-ink/50 backdrop-blur-xl transition-colors hover:border-accent"
      >
        <Palette size={18} className="text-accent" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ duration: 0.3, ease }}
            className="absolute right-0 top-full mt-3 flex origin-top-right gap-2 rounded-full border border-white/10 bg-ink/90 p-2 backdrop-blur-xl"
          >
            {accents.map((a) => (
              <button
                key={a.value}
                title={a.name}
                aria-label={a.name}
                onClick={() => setCurrent(a.value)}
                className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                style={{ background: a.value, boxShadow: current === a.value ? `0 0 0 2px #07070a, 0 0 0 4px ${a.value}` : "none" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ================= CHAPTER RAIL ================= */
export function ChapterRail({ active }: { active: string }) {
  const [hover, setHover] = useState<string | null>(null);
  if (active === "home") return null;
  return (
    <div className="fixed right-6 top-1/2 z-[95] hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex">
      {nav.map((n) => {
        const on = active === n.id;
        return (
          <button
            key={n.id}
            onClick={() => scrollToId(n.id)}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            aria-label={`Go to ${n.label}`}
            className="group flex items-center gap-3"
          >
            <span className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-all duration-300 ${on ? "text-accent" : hover === n.id ? "text-bone" : "text-mute opacity-0"}`}>
              {n.label}
            </span>
            <span className={`block rounded-full transition-all duration-300 ${on ? "h-1.5 w-7 bg-accent" : "h-1.5 w-1.5 bg-bone/30 group-hover:bg-bone group-hover:w-4"}`} />
          </button>
        );
      })}
    </div>
  );
}

/* ================= BACK TO TOP ================= */
export function BackToTop() {
  const { scrollYProgress, scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setShow(v > 700));
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={() => scrollToId("home")}
          aria-label="Back to top"
          className="group fixed bottom-5 right-5 z-[110] grid h-14 w-14 place-items-center rounded-full bg-ink/70 backdrop-blur-xl md:bottom-8 md:right-8"
        >
          <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
            <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="2" />
            <motion.circle cx="28" cy="28" r="26" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ pathLength: scrollYProgress }} />
          </svg>
          <ArrowUp size={18} className="transition-transform duration-300 group-hover:-translate-y-1" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ================= TEAM HEX TOAST ================= */
export function HexToast({ ready }: { ready: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ready || sessionStorage.getItem("nirob-hex-toast")) return;
    const a = window.setTimeout(() => {
      const past = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (past < 0.22 || past > 0.42) return; // never over the home hero, never on the pinned 3D sections
      const inLocked = ["bncc", "skills", "portfolio"].some((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.6;
      });
      if (inLocked) return;
      setShow(true);
      sessionStorage.setItem("nirob-hex-toast", "1");
    }, 4000);
    const b = window.setTimeout(() => setShow(false), 21000);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, [ready]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 420, y: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, y: -20, opacity: 0 }}
          transition={{ duration: 0.7, ease }}
          className="fixed right-3 top-16 z-[115] w-[min(260px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-panel/90 p-2.5 backdrop-blur-xl md:right-6 md:top-20 md:w-[290px] md:p-3"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#9d9b93]/30" />
              <SiteImage file="ff.png" alt="TEAM HEX" className="relative h-14 w-14 rounded-full bg-white/5 object-contain p-1" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">My e-sports team</p>
              <p className="font-display text-lg font-bold">TEAM HEX</p>
            </div>
            <button onClick={() => setShow(false)} aria-label="Close notification" className="self-start text-mute hover:text-bone">
              <X size={16} />
            </button>
          </div>
          <a href={profile.teamHex} target="_blank" rel="noreferrer" className="group mt-3 flex items-center justify-between rounded-xl bg-accent px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            <RollText>Visit Now</RollText>
            <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
          </a>
          <motion.div className="absolute bottom-0 left-0 h-[2px] bg-accent" initial={{ width: "100%" }} animate={{ width: 0 }} transition={{ duration: 15, ease: "linear" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
