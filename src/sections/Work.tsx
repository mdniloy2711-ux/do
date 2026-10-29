import { useEffect, useRef, useState, useMemo } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  Globe,
  Lock,
  Maximize2,
  Sparkles,
  X,
} from "lucide-react";
import { profile, projects } from "../data";
import { ease, lockScroll, pad } from "../lib";
import {
  GithubIcon,
  Label,
  Magnetic,
  RollText,
  SiteImage,
} from "../components/ui";

type ProjectItem = (typeof projects)[number];

/* ================= SCROLL-PARALLAX PROJECT CARD ================= */
function ScrollProjectRow({
  project,
  index,
  total,
  reversed,
  onOpenViewer,
}: {
  project: ProjectItem;
  index: number;
  total: number;
  reversed: boolean;
  onOpenViewer: (idx: number) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll tracking for continuous depth parallax
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    restDelta: 0.001,
  });

  // Parallax glide for the image inside the frame
  const imageY = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);
  const imageScale = useTransform(smoothProgress, [0, 0.5, 1], [1.12, 1.02, 1.12]);

  // Subtle 3D tilt as the card enters and leaves
  const cardRotateX = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [12, 0, 0, -12]);
  const cardOpacity = useTransform(smoothProgress, [0, 0.18, 0.85, 1], [0.35, 1, 1, 0.35]);

  return (
    <motion.article
      ref={cardRef}
      style={{
        rotateX: cardRotateX,
        opacity: cardOpacity,
        transformPerspective: 1200,
      }}
      className="group relative w-full py-12 md:py-20 lg:py-24"
    >
      {/* Background ambient glow that reacts to scroll */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-[130px] transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          opacity: 0.07,
        }}
      />

      <div
        className={`relative grid items-center gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-20 ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* ================= COLUMN A: BROWSER DEVICE MOCKUP ================= */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease }}
          className="lg:col-span-7"
        >
          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/12 bg-[#0d0d0c] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] transition-all duration-500 group-hover:border-white/25 group-hover:shadow-[0_40px_110px_-25px_rgba(0,0,0,0.95)]">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#141412] px-4 py-3 sm:px-5">
              {/* Traffic lights */}
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e53935]/80 transition-opacity hover:opacity-100" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#fbc02d]/80 transition-opacity hover:opacity-100" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#2e7d32]/80 transition-opacity hover:opacity-100" />
              </div>

              {/* URL Address Pill */}
              <div className="flex max-w-[280px] flex-1 items-center justify-center sm:max-w-[340px]">
                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[9px] text-mute transition-colors group-hover:border-white/20 sm:text-[10px]">
                  <Lock size={10} className="text-accent/80" />
                  <span className="truncate tracking-wider text-bone/70">
                    nirob-420.github.io/{project.slug}/
                  </span>
                </div>
              </div>

              {/* Quick View Button */}
              <button
                type="button"
                onClick={() => onOpenViewer(index)}
                aria-label={`Inspect ${project.title}`}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-mute transition-colors hover:border-accent hover:bg-accent hover:text-ink sm:text-[10px]"
              >
                <Maximize2 size={11} />
                <span className="hidden sm:inline">Inspect</span>
              </button>
            </div>

            {/* Studio Presentation Stage with Realistic Device Mockup & Scroll Parallax */}
            <div
              className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#1c1c1a_0%,#090908_75%)] p-6 sm:p-10 flex items-center justify-center"
              onClick={() => onOpenViewer(index)}
              data-cursor="Inspect"
            >
              {/* Studio ambient grid and corner crosshairs */}
              <div className="dot-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

              {/* Watermark project index */}
              <span className="pointer-events-none absolute right-4 bottom-2 font-display text-[8rem] sm:text-[11rem] font-black leading-none text-white/[0.03] select-none">
                {pad(index + 1)}
              </span>

              {/* Floating Modern Device Frame (cropped to show actual site UI with scroll on hover) */}
              <motion.div
                style={{ y: imageY, scale: imageScale }}
                className="relative z-10 w-[240px] sm:w-[270px] md:w-[300px] aspect-[9/18] rounded-[2.6rem] border-[7px] sm:border-[8px] border-[#222220] bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden transition-transform duration-700 group-hover:scale-[1.03]"
              >
                {/* Speaker Notch / Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 h-4 w-24 rounded-full bg-[#161614] flex items-center justify-center gap-1.5 px-2">
                  <span className="h-2 w-2 rounded-full bg-black/80 ring-1 ring-white/10" />
                  <span className="h-1.5 w-8 rounded-full bg-[#20201d]" />
                </div>

                {/* Inner Screen with Android Chrome Bar Cleanly Shifted Out via translateY and Android Nav Bar Clipped */}
                <div className="relative h-full w-full overflow-hidden bg-[#0c0c0b] pt-2.5 pb-8">
                  <div className="relative h-full w-full overflow-hidden rounded-b-[1.8rem]">
                    <SiteImage
                      file={project.img}
                      alt={`${project.title} screenshot`}
                      className="w-full object-cover object-top -translate-y-[11.2%] transition-transform duration-[4.5s] ease-in-out group-hover:-translate-y-[55%]"
                      loading="lazy"
                    />
                  </div>

                  {/* Glass Sheen Reflection */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent" />
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
                </div>

                {/* Bottom Home Indicator Bar */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 h-1 w-28 rounded-full bg-white/40" />
              </motion.div>

              {/* Floating Status Badges */}
              <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-bone backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span>Active Project</span>
              </div>

              {/* Bottom Quick-Action Bar */}
              <div className="absolute inset-x-4 bottom-4 z-20 flex items-end justify-between opacity-90 transition-opacity duration-300 sm:inset-x-6 sm:bottom-6 sm:opacity-0 sm:group-hover:opacity-100">
                <span className="rounded-full border border-white/20 bg-ink/80 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone backdrop-blur-md">
                  Hover to Scroll · Click for Case
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-ink shadow-[0_10px_30px_rgba(255,91,46,0.4)] transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ================= COLUMN B: EDITORIAL DETAILS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.85, ease, delay: 0.12 }}
          className="flex flex-col items-start lg:col-span-5"
        >
          {/* Project Index & Category Pill */}
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2 font-bold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {pad(index + 1)} / {pad(total)}
            </span>
            <span className="text-white/20">|</span>
            <span className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[10px] text-bone/80">
              {project.cat}
            </span>
            {project.year && (
              <span className="text-[10px] text-mute">{project.year}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-white transition-colors duration-300 group-hover:text-accent sm:text-4xl md:text-5xl lg:text-[2.8rem]">
            {project.title}
          </h3>

          {/* Role badge */}
          {project.role && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent/80">
              {project.role}
            </p>
          )}

          {/* Description */}
          <p className="mt-4 text-sm leading-relaxed text-bone/70 sm:text-base">
            {project.desc}
          </p>

          {/* Tech tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mute transition-colors hover:border-white/25 hover:text-bone"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.25}>
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-all hover:shadow-[0_10px_30px_rgba(255,91,46,0.35)]"
              >
                <RollText>Live Demo</RollText>
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover/btn:rotate-45"
                />
              </a>
            </Magnetic>

            <Magnetic strength={0.25}>
              <a
                href={project.code}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View code for ${project.title}`}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.02] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-bone transition-colors hover:border-bone hover:bg-white/10"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>Code</span>
              </a>
            </Magnetic>

            <button
              type="button"
              onClick={() => onOpenViewer(index)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-mute transition-colors hover:border-white/25 hover:text-bone"
            >
              <Eye size={13} />
              <span>Details</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle section separator hairline */}
      {index < total - 1 && (
        <div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent md:mt-24" />
      )}
    </motion.article>
  );
}

/* ================= 3D CASE STUDY VIEWER MODAL ================= */
function ProjectViewer({
  index,
  onClose,
  onNext,
}: {
  index: number | null;
  onClose: () => void;
  onNext: (dir: number) => void;
}) {
  const open = index !== null;
  const p = index !== null ? projects[index] : null;

  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext(1);
      if (e.key === "ArrowLeft") onNext(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onNext]);

  return (
    <AnimatePresence>
      {open && p && index !== null && (
        <motion.div
          className="fixed inset-0 z-[190] overflow-y-auto bg-black/85 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="flex min-h-full items-center justify-center px-4 py-12 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 60, rotateX: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.55, ease }}
              style={{ transformPerspective: 1400 }}
              className="relative grid w-full max-w-5xl overflow-hidden rounded-[2.2rem] border border-white/15 bg-[#0b0b0a] shadow-[0_50px_140px_rgba(0,0,0,0.95)] lg:grid-cols-[1.1fr_0.9fr]"
              role="dialog"
              aria-modal="true"
              aria-label={`${p.title} project`}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Close case study"
                className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/60 backdrop-blur transition-colors hover:bg-bone hover:text-ink sm:right-6 sm:top-6"
              >
                <X size={18} />
              </button>

              {/* Preview Window Column */}
              <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_50%_40%,#1f1f1d,#080808_75%)] p-6 sm:p-10 lg:min-h-[580px] lg:border-b-0 lg:border-r">
                <div className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

                <motion.div
                  key={p.title}
                  initial={{ rotateY: 12, y: 24, opacity: 0 }}
                  animate={{ rotateY: 0, y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease }}
                  className="relative w-[220px] sm:w-[250px] aspect-[9/18] overflow-hidden rounded-[2.4rem] border-[6px] border-[#2a2a28] bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.15)]"
                >
                  {/* Speaker Notch / Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 h-3.5 w-20 rounded-full bg-[#181816] flex items-center justify-center gap-1.5 px-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-black/80 ring-1 ring-white/10" />
                    <span className="h-1 w-6 rounded-full bg-[#22221f]" />
                  </div>

                  {/* Clean site preview with cropped Android Chrome and Nav bars */}
                  <div className="relative h-full w-full overflow-hidden bg-[#0c0c0b] pt-2.5 pb-8">
                    <div className="relative h-full w-full overflow-hidden rounded-b-[1.8rem]">
                      <SiteImage
                        file={p.img}
                        alt={`${p.title} preview`}
                        className="w-full object-cover object-top -translate-y-[11.2%] transition-transform duration-[4.5s] ease-in-out hover:-translate-y-[55%]"
                      />
                    </div>
                  </div>

                  {/* Bottom indicator */}
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 h-1 w-24 rounded-full bg-white/40" />
                </motion.div>

                <span className="absolute bottom-4 left-6 font-mono text-[9px] uppercase tracking-[0.24em] text-bone/40">
                  Case 0{index + 1} / {p.cat}
                </span>
              </div>

              {/* Details Column */}
              <div className="relative flex flex-col justify-between gap-8 p-7 md:p-10">
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                    <span>
                      {pad(index + 1)} / {pad(projects.length)}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-bone/80">
                      {p.cat}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.92] tracking-tight text-white sm:text-4xl md:text-5xl">
                    {p.title}
                  </h3>

                  {p.role && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      {p.role}
                    </p>
                  )}

                  <p className="mt-4 text-sm leading-relaxed text-bone/70 sm:text-base">
                    {p.desc}
                  </p>

                  {/* Deep Specs Grid */}
                  <div className="mt-6 grid grid-cols-2 gap-3 font-mono">
                    {[
                      ["Year", p.year || "2024 — 2025"],
                      ["Role", p.role || "Design & Code"],
                      ["Repository", `nirob-420/${p.slug}`],
                      ["Category", p.cat],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                      >
                        <p className="text-[8px] uppercase tracking-[0.2em] text-mute">
                          {k}
                        </p>
                        <p className="mt-1 truncate text-xs text-bone/90">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-mute"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Modal Actions */}
                <div>
                  <div className="flex gap-2.5">
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-1 items-center justify-between rounded-full bg-accent px-5 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-bone"
                    >
                      <RollText>Open Live Website</RollText>
                      <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:rotate-45"
                      />
                    </a>
                    <a
                      href={p.code}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.title} source code`}
                      className="grid h-12 w-12 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
                    >
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Prev / Next Keyboard Navigation */}
                  <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                    <button
                      onClick={() => onNext(-1)}
                      className="group flex items-center gap-2 transition-colors hover:text-bone"
                    >
                      <ArrowLeft
                        size={14}
                        className="transition-transform group-hover:-translate-x-1"
                      />{" "}
                      Prev
                    </button>
                    <span className="hidden text-mute/50 sm:inline">
                      ← → to browse · esc to close
                    </span>
                    <button
                      onClick={() => onNext(1)}
                      className="group flex items-center gap-2 transition-colors hover:text-bone"
                    >
                      Next{" "}
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= MAIN WORK / PROJECT SECTION ================= */
export function Work() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewer, setViewer] = useState<number | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const cats = ["All", ...Array.from(new Set(projects.map((p) => p.cat)))];
    return cats;
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return projects;
    return projects.filter((p) => p.cat === selectedCategory);
  }, [selectedCategory]);

  const stepViewer = (dir: number) => {
    setViewer((current) => {
      if (current === null) return current;
      return (current + dir + projects.length) % projects.length;
    });
  };

  return (
    <section id="portfolio" className="relative mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
      {/* Top Label & Chapter Mark */}
      <Label index="08">My Portfolio</Label>

      {/* Header matching Code & Chill Reference Structure */}
      <div className="mt-10 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-mute">
            <span className="flex items-center gap-2 text-accent">
              <Sparkles size={12} />
              Featured Showcase
            </span>
            <span>·</span>
            <span>{projects.length} Projects Shipped</span>
          </div>

          <h2 className="mt-4 font-display text-[9.5vw] font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            <span className="bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent">
              Selected
            </span>{" "}
            <span className="pr-2 font-serif font-light lowercase italic text-gray-300">
              work
            </span>
            <sup className="ml-2 align-top font-mono text-sm sm:text-base font-normal text-accent md:text-xl">
              ({pad(projects.length)})
            </sup>
          </h2>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-gray-400 sm:text-base">
          Interactive web applications, high-performance responsive portals, and creative animations
          crafted end-to-end with clean code, semantic design, and fluid motion.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-12 flex flex-wrap items-center gap-2 border-b border-white/10 pb-6">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          const count =
            cat === "All"
              ? projects.length
              : projects.filter((p) => p.cat === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`relative rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                active ? "text-ink" : "text-mute hover:text-bone"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="active-cat-pill"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{cat}</span>
                <span
                  className={`text-[9px] ${
                    active ? "text-ink/80" : "text-mute/60"
                  }`}
                >
                  ({pad(count)})
                </span>
              </span>
            </button>
          );
        })}

        <div className="ml-auto hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute lg:flex">
          <Globe size={12} className="text-accent" />
          <span>Scroll to explore cards</span>
        </div>
      </div>

      {/* Scrolling List of Projects */}
      <div className="mt-12 space-y-4 md:mt-16">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p, i) => {
            // Find its real global index for the viewer modal
            const globalIndex = projects.findIndex((proj) => proj.slug === p.slug);
            const isReversed = i % 2 !== 0;

            return (
              <ScrollProjectRow
                key={p.slug}
                project={p}
                index={globalIndex}
                total={projects.length}
                reversed={isReversed}
                onOpenViewer={setViewer}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Callout Banner */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease }}
        className="mt-20 flex flex-col items-center justify-between gap-8 rounded-[2.2rem] border border-white/12 bg-gradient-to-b from-[#141412] to-[#0a0a09] p-8 text-center sm:p-12 md:flex-row md:text-left lg:p-16"
      >
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
            GitHub Archive · Open Source
          </span>
          <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-tight tracking-tight text-white md:text-4xl">
            Want to inspect more code repositories?
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mute">
            Browse all public repositories, algorithms, micro-interactions, and experimental code
            showcases directly on my GitHub profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Magnetic strength={0.35}>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-transform hover:scale-105"
            >
              <GithubIcon className="h-4 w-4" />
              <RollText>Browse GitHub</RollText>
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:rotate-45"
              />
            </a>
          </Magnetic>

          <Magnetic strength={0.25}>
            <a
              href="#contact"
              className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-bone transition-colors hover:border-bone hover:bg-white/10"
            >
              <RollText>Start a Project</RollText>
            </a>
          </Magnetic>
        </div>
      </motion.div>

      {/* Case Study Modal */}
      <ProjectViewer
        index={viewer}
        onClose={() => setViewer(null)}
        onNext={stepViewer}
      />
    </section>
  );
}
