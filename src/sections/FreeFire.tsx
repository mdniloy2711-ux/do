import { useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, Eye, Heart, Play } from "lucide-react";
import { clips, education, profile } from "../data";
import { ease } from "../lib";
import { ChapterMark, FadeUp, Label, Marquee, RollText, SiteImage, SplitText } from "../components/ui";

function Clip({ clip, index }: { clip: (typeof clips)[number]; index: number }) {
  const [playing, setPlaying] = useState(false);
  return (
    <FadeUp delay={index * 0.12} className="group">
      <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-panel" data-cursor={playing ? undefined : "Play"}>
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${clip.id}?autoplay=1&rel=0`}
            title={clip.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="absolute inset-0 h-full w-full" aria-label={`Play ${clip.title}`}>
            <img
              src={`https://i.ytimg.com/vi/${clip.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="h-full w-full scale-105 object-cover img-mono transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-115"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur">Clip 0{index + 1}</span>
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-bone text-ink shadow-[0_0_60px_rgba(244,242,236,.55)] transition-transform duration-500 group-hover:scale-125">
              <Play size={22} fill="currentColor" className="ml-0.5" />
            </span>
          </button>
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h4 className="font-display text-xl font-bold">{clip.title}</h4>
          <p className="mt-1 text-sm text-mute">{clip.desc}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-5 font-mono text-[11px] uppercase tracking-[0.15em] text-mute">
        <span className="flex items-center gap-1.5"><Eye size={14} className="text-bone" /> {clip.views} views</span>
        <span className="flex items-center gap-1.5"><Heart size={14} className="text-bone" /> {clip.likes}</span>
      </div>
    </FadeUp>
  );
}

export function FreeFire() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });
  const logoX = useTransform(sx, (v) => v * 30);
  const logoY = useTransform(sy, (v) => v * 30);
  const ringX = useTransform(sx, (v) => v * -15);
  const ringY = useTransform(sy, (v) => v * -15);
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sp } = useScroll({ target: stageRef, offset: ["start end", "end start"] });
  const stageRotY = useTransform(sp, [0, 1], [-40, 40]);
  const stageRotX = useTransform(sp, [0, 1], [28, -20]);
  const logoZ = useTransform(sp, [0, 0.5, 1], [-200, 80, -120]);

  const totals = [
    { v: "35.7K", l: "Total Views" },
    { v: "3.9K", l: "Total Likes" },
    { v: "03", l: "Featured Clips" },
  ];

  return (
    <section id="freefire" className="relative z-20 -mt-10 overflow-hidden rounded-t-[2.5rem] bg-ink md:-mt-16 md:rounded-t-[4rem]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-bone/20 blur-[140px]" />
        <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#9d9b93]/15 blur-[140px]" />
      </div>

      <div className="relative pt-24 md:pt-32">
        <Marquee items={["Free Fire", "E-Sports", "Team Hex", "Booyah"]} className="font-display text-[18vw] font-extrabold uppercase leading-none text-stroke opacity-[0.12] md:text-[11vw]" sep="●" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-5 pb-28 md:px-10 md:pb-40">
        <Label index="06" className="mt-10">Free Fire E-Sports</Label>
        <ChapterMark index="06" title="On the field, in the lobby" meta="Team Hex / E-Sports" className="-mx-5 mt-8 md:-mx-10" />

        <div className="mt-14 grid items-center gap-16 lg:grid-cols-2">
          {/* logo stage */}
          <motion.div
            ref={stageRef}
            style={{ rotateY: stageRotY, rotateX: stageRotX, transformPerspective: 1200, transformStyle: "preserve-3d" }}
            className="relative mx-auto grid aspect-square w-full max-w-[520px] place-items-center"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set((e.clientX - r.left) / r.width - 0.5);
              my.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onMouseLeave={() => { mx.set(0); my.set(0); }}
          >
            <motion.div style={{ x: ringX, y: ringY }} className="absolute inset-0">
              <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-bone/40" />
              <div className="absolute inset-[12%] animate-spin-rev rounded-full border border-white/10" />
              <div className="absolute inset-[24%] rounded-full border border-bone/20" />
              <div className="absolute inset-0 animate-spin-slow">
                <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone shadow-[0_0_20px_#f4f2ec]" />
              </div>
              <div className="absolute inset-[12%] animate-spin-rev">
                <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#9d9b93] shadow-[0_0_20px_#9d9b93]" />
              </div>
            </motion.div>
            <div className="absolute inset-[22%] rounded-full bg-white/10 blur-3xl" />
            <motion.div
              style={{ x: logoX, y: logoY, z: logoZ }}
              initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease }}
              className="relative w-[62%] drop-shadow-[0_20px_60px_rgba(244,242,236,.35)]"
            >
              <SiteImage file="ff.png" alt="TEAM HEX wolf logo" className="w-full" />
            </motion.div>
          </motion.div>

          <div>
            <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight md:text-7xl">
              <SplitText text="I Am Free Fire" />
              <br />
              <span className="font-serif font-normal normal-case italic text-bone">
                <SplitText text="E-Sports Player" delay={0.3} />
              </span>
            </h2>
            <FadeUp delay={0.2}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/70">
                I am a passionate Free Fire e-sports player and supporter. My journey in competitive gaming has been filled with exciting challenges and memorable victories. Here are some of my best gameplay clips that showcase my skills and strategies.
              </p>
            </FadeUp>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {totals.map((t, i) => (
                <FadeUp key={t.l} delay={0.25 + i * 0.08} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
                  <p className="font-display text-[15px] font-extrabold text-bone sm:text-2xl md:text-3xl">{t.v}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-mute md:text-[10px]">{t.l}</p>
                </FadeUp>
              ))}
            </div>
            <FadeUp delay={0.4}>
              <a href={profile.teamHex} target="_blank" rel="noreferrer" className="group mt-10 inline-flex items-center gap-3 rounded-full border border-bone/50 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-bone hover:text-ink">
                <RollText>Visit Team Hex</RollText>
                <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:rotate-45" />
              </a>
            </FadeUp>
          </div>
        </div>

        <div className="mt-28">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h3 className="font-display text-3xl font-bold md:text-5xl">
              <SplitText text="Our Gameplay Clips" />
            </h3>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-mute md:block">( Click to play )</span>
          </div>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {clips.map((c, i) => (
              <Clip key={c.id} clip={c} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StackCard({ e, i, n, progress }: { e: (typeof education)[number]; i: number; n: number; progress: MotionValue<number> }) {
  const range: [number, number] = [i / n, 1];
  const targetScale = 1 - (n - 1 - i) * 0.07;
  const scale = useTransform(progress, range, [1, targetScale]);
  const rotateX = useTransform(progress, range, [0, (n - 1 - i) * 7]);
  const bright = useTransform(progress, range, [1, 1 - (n - 1 - i) * 0.28]);
  const filter = useTransform(bright, (b) => `brightness(${b})`);

  return (
    <div className="sticky flex h-[78svh] items-start justify-center" style={{ top: `calc(14svh + ${i * 34}px)`, perspective: 1400 }}>
      <motion.div
        initial={{ opacity: 0, y: 140, rotateX: -35 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.1, ease }}
        className="w-full"
      >
        <motion.div
          style={{ scale, rotateX, filter, transformOrigin: "50% 0%" }}
          className="group relative overflow-hidden rounded-[2rem] border border-white/10 p-7 md:p-12"
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(140deg, #171716 0%, #0c0c0c 60%)" }} />
          <div
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-50"
            style={{ background: "var(--accent)" }}
          />
          <div className="bg-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />

          <div className="relative flex items-start justify-between gap-4">
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">{e.years}</span>
            <span className="font-mono text-xs text-mute">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          </div>
          <p className="relative mt-10 font-display text-[3.4rem] font-extrabold leading-none text-stroke-accent md:text-[6rem]">
            {e.years.split(" ")[0]}
          </p>
          <h3 className="relative mt-4 font-display text-3xl font-bold md:text-5xl">{e.title}</h3>
          <p className="relative mt-3 font-mono text-xs uppercase tracking-[0.12em] text-bone/80">{e.place}</p>
          <p className="relative mt-6 max-w-xl leading-relaxed text-mute">{e.desc}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Education() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="education" className="relative mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-40">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-20 [&>*]:min-w-0">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Label index="07">My Education</Label>
          <h2 className="mt-8 font-display text-[9.5vw] font-extrabold uppercase leading-[0.88] tracking-tight lg:text-[4.2vw]">
            <SplitText text="Learning" />
            <br />
            <span className="font-serif font-normal normal-case italic text-accent">
              <SplitText text="never stops." delay={0.25} />
            </span>
          </h2>
          <FadeUp delay={0.3}>
            <p className="mt-8 max-w-sm text-bone/60">From the classroom to late-night coding sessions, every step has shaped how I think, design and build.</p>
          </FadeUp>
          <div className="mt-10 hidden items-center gap-4 lg:flex">
            <div className="relative h-40 w-px bg-white/10">
              <motion.div className="absolute inset-0 origin-top bg-accent" style={{ scaleY: scrollYProgress }} />
            </div>
            <div className="space-y-6 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
              {education.map((e) => (
                <p key={e.title}>{e.title}</p>
              ))}
            </div>
          </div>
        </div>

        <div ref={ref} className="relative pb-[6svh]">
          {education.map((e, i) => (
            <StackCard key={e.title} e={e} i={i} n={education.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
