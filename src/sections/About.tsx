import { useRef } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { about, profile, stats, story, traits } from "../data";
import { ease, getAge, pad, useNow } from "../lib";
import { ChapterMark, Counter, FadeUp, Label, RotatingBadge, ScrollFlip, ScrollWords, SiteImage, SplitText } from "../components/ui";

const hidden = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;

/* Card that flips in 3D (portrait -> crest) as you scroll past it */
function ScrollFlipCard() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.05"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 20, restDelta: 0.001 });
  const rotateY = useTransform(p, [0.25, 0.62], [0, 180]);
  const rotateX = useTransform(p, [0, 1], [14, -14]);
  const rotateZ = useTransform(p, [0, 0.5, 1], [-5, 0, 4]);
  const scale = useTransform(p, [0, 0.45, 1], [0.86, 1.04, 0.92]);
  const shine = useTransform(p, [0.1, 0.9], ["-120%", "220%"]);

  return (
    <div ref={ref} className="mx-auto w-full max-w-[440px]" style={{ perspective: 1400 }}>
      <motion.div style={{ rotateY, rotateX, rotateZ, scale, transformStyle: "preserve-3d" }} className="relative aspect-[4/5]" data-cursor="Nirob">
        {/* front */}
        <div style={hidden} className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/10 bg-panel">
          <SiteImage file="yes.jpg" alt="Nirob" className="h-full w-full object-cover object-[50%_30%]" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
          <motion.div style={{ x: shine }} className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">The developer</p>
              <p className="font-display text-3xl font-extrabold">Nirob</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">↻ Scroll</span>
          </div>
        </div>
        {/* back */}
        <div style={{ ...hidden, transform: "rotateY(180deg)" }} className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-[2rem] bg-accent p-7 text-ink">
          <div className="bg-grid absolute inset-0 opacity-40 mix-blend-multiply" />
          <div className="relative flex w-full justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
            <span>Est. 2010</span>
            <span>Sylhet, BD</span>
          </div>
          <SiteImage file="hii.png" alt="NB crest" className="relative w-[62%] rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,.6)]" loading="lazy" />
          <div className="relative text-center">
            <p className="font-display text-3xl font-extrabold">{profile.stylized}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em]">Web Developer & Designer</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-40">
      <Label index="01">About Me</Label>
      <ChapterMark index="01" title="The person behind the pixels" meta="About" className="-mx-5 mt-10 md:-mx-10" />

      <ScrollWords
        text={about.p1}
        className="mt-10 max-w-[1300px] font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.6rem]"
      />

      <div className="mt-24 grid items-center gap-20 lg:mt-36 lg:grid-cols-2 lg:gap-24">
        <ScrollFlipCard />

        <div className="flex flex-col gap-12">
          <ScrollFlip>
            <h3 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight md:text-7xl">
              Clean code,
              <br />
              <span className="font-serif font-normal normal-case italic text-accent">delightful</span> UX.
            </h3>
          </ScrollFlip>
          <FadeUp delay={0.1}>
            <p className="max-w-md text-lg leading-relaxed text-bone/70">{about.p2}</p>
          </FadeUp>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <FadeUp key={s.label} delay={0.15 + i * 0.1} className="border-t border-white/15 pt-5">
                <Counter to={s.value} suffix={s.suffix} className="font-display text-6xl font-extrabold text-accent md:text-7xl" />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{s.label}</p>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.2}>
            <RotatingBadge text={`${profile.stylized} • web developer • designer • `} size={150}>
              <SiteImage file="hii.png" alt="" className="h-16 w-16 rounded-full object-cover" />
            </RotatingBadge>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Flip({ value }: { value: string }) {
  return (
    <span className="inline-flex">
      {value.split("").map((c, i) => (
        <span key={i} className="relative inline-block overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={c}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease }}
              className="inline-block tabular-nums"
            >
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

export function PersonalInfo() {
  const now = useNow();
  const age = getAge(profile.birth, now);
  const details = [
    { k: "Full Name", v: profile.fullName },
    { k: "Date of Birth", v: profile.birthLabel },
    { k: "Location", v: profile.location },
    { k: "Hometown", v: profile.hometown },
    { k: "Languages", v: profile.languages },
    { k: "Nationality", v: profile.nationality },
    { k: "Interests", v: profile.interests },
  ];

  return (
    <section id="personal-info" className="relative z-10 rounded-t-[2.5rem] bg-bone text-ink md:rounded-t-[4rem]">
      <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <Label index="03" className="!text-ink/50">Personal Information</Label>
        <h2 className="mt-8 font-display text-[15vw] font-extrabold uppercase leading-[0.85] tracking-tight md:text-[10vw]">
          <SplitText text="About" />{" "}
          <span className="inline-block rounded-[0.15em] bg-accent px-[0.12em] font-serif font-normal normal-case italic">
            <SplitText text="Nirob" delay={0.25} />
          </span>
        </h2>

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-24">
          <div className="space-y-8">
            {story(age.years).map((p, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <p className={i === 0 ? "text-xl leading-relaxed md:text-2xl" : "text-lg leading-relaxed text-ink/70"}>{p}</p>
              </FadeUp>
            ))}
            <FadeUp delay={0.2} className="flex flex-wrap gap-2">
              {traits.map((t) => (
                <span key={t} className="rounded-full border border-ink/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-300 hover:bg-ink hover:text-bone" data-hover>
                  {t}
                </span>
              ))}
            </FadeUp>

            {/* live age */}
            <FadeUp delay={0.25}>
              <div className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-bone md:p-10">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
                <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                  <span>Current Age</span>
                  <span className="flex items-center gap-2 text-bone">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-bone" /> Live
                  </span>
                </div>
                <div className="relative mt-6 grid grid-cols-3 gap-4">
                  {[
                    { v: age.years, l: "Years" },
                    { v: age.months, l: "Months" },
                    { v: age.days, l: "Days" },
                  ].map((x) => (
                    <div key={x.l}>
                      <p className="font-display text-4xl font-extrabold leading-none sm:text-5xl md:text-7xl">
                        <Flip value={pad(x.v)} />
                      </p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{x.l}</p>
                    </div>
                  ))}
                </div>
                <div className="relative mt-6 flex items-center gap-3 border-t border-white/10 pt-5 font-mono text-xl tabular-nums md:text-2xl">
                  <Flip value={pad(age.hours)} />
                  <span className="animate-pulse text-accent">:</span>
                  <Flip value={pad(age.minutes)} />
                  <span className="animate-pulse text-accent">:</span>
                  <Flip value={pad(age.seconds)} />
                  <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-mute">& counting</span>
                </div>
              </div>
            </FadeUp>
          </div>

          <div>
            <FadeUp>
              <h3 className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-ink/50">Personal Details</h3>
            </FadeUp>
            <ul>
              {details.map((d, i) => (
                <motion.li
                  key={d.k}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-5% 0px" }}
                  transition={{ duration: 0.8, ease, delay: i * 0.06 }}
                  className="group relative grid grid-cols-[110px_1fr] gap-4 py-6 sm:grid-cols-[160px_1fr]"
                >
                  <motion.span
                    className="absolute inset-x-0 top-0 h-px origin-left bg-ink/15"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease, delay: i * 0.06 }}
                  />
                  <span className="pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">{d.k}</span>
                  <span className="font-display text-lg font-semibold transition-transform duration-500 group-hover:translate-x-2 md:text-2xl">{d.v}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
