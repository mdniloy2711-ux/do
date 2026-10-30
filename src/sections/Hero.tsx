import { useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { ease, scrollToId } from "../lib";
import { Magnetic, SiteImage } from "../components/ui";
import PixelPortrait from "../components/PixelPortrait";

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [replay, setReplay] = useState(0);
  const fitRef = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const measure = () => {
      const el = fitRef.current;
      if (!el) return;
      const avail = el.parentElement!.clientWidth * 0.92;
      const natural = el.offsetWidth || 1;
      setFit(Math.min(1, avail / natural));
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const t = window.setTimeout(measure, 600);
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(t); window.removeEventListener("resize", measure); };
  }, []);
  const [hoverName, setHoverName] = useState(false);
  const portraitRef = useRef<HTMLDivElement>(null);
  const [pixelOk, setPixelOk] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scrollSpring = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.0005 });

  const portraitY = useTransform(scrollSpring, [0, 1], [0, -140]);
  const portraitScale = useTransform(scrollSpring, [0, 1], [1, 1.12]);
  const leftX = useTransform(scrollSpring, [0, 1], [0, -180]);
  const rightX = useTransform(scrollSpring, [0, 1], [0, 180]);
  const nameY = useTransform(scrollSpring, [0, 1], [0, -60]);
  const metaOpacity = useTransform(scrollSpring, [0, 0.5], [1, 0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 45, damping: 18 });
  const smy = useSpring(my, { stiffness: 45, damping: 18 });
  const tiltY = useTransform(smx, [-0.5, 0.5], [-7, 7]);
  const tiltX = useTransform(smy, [-0.5, 0.5], [5, -5]);
  const glowX = useTransform(smx, [-0.5, 0.5], ["38%", "62%"]);
  const glowY = useTransform(smy, [-0.5, 0.5], ["28%", "48%"]);

  const gradient = "bg-gradient-to-b from-white via-[#d9d7d1] to-[#4c4a45] bg-clip-text text-transparent";
  const nameType = "font-display font-extrabold uppercase leading-[0.78] tracking-[-0.06em]";

  return (
    <section
      id="home"
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
      className="relative flex min-h-[100svh] items-end justify-center overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 38%, #232322 0%, #0f0f0e 52%, #000 100%)" }}
    >
      {/* atmosphere */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `radial-gradient(38rem 38rem at ${glowX} ${glowY}, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#000_100%)]" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_50%_40%,black,transparent_70%)]" />

      {/* editorial frame */}
      <div className="pointer-events-none absolute inset-3 z-40 border border-white/[0.07] md:inset-5" aria-hidden>
        {[
          "left-0 top-0 border-l border-t",
          "right-0 top-0 border-r border-t",
          "left-0 bottom-0 border-l border-b",
          "right-0 bottom-0 border-r border-b",
        ].map((c) => (
          <span key={c} className={`absolute h-6 w-6 border-bone/40 md:h-9 md:w-9 ${c}`} />
        ))}
        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-bone/25" />
        <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-bone/25" />
      </div>

      {/* faint edge labels, like the reference's quiet chrome */}
      <motion.div style={{ opacity: metaOpacity }} className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-between px-5 font-mono text-[9px] uppercase tracking-[0.24em] text-white/40 md:top-28 md:px-10">
        <span>Portfolio / {new Date().getFullYear()}</span>
        <span className="hidden sm:block">Al Nasif MD Nirob</span>
      </motion.div>

      {/* portrait */}
      <motion.div
        style={{ y: portraitY, scale: portraitScale }}
        className="absolute inset-x-0 bottom-[24vh] z-10 mx-auto flex w-fit items-end justify-center md:bottom-[21vh]"
      >
        <motion.div
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
          ref={portraitRef}
          className="relative h-[41svh] w-[62vw] max-w-[440px] sm:h-[46svh] sm:w-[38vw] lg:h-[56svh] lg:w-auto lg:aspect-[3/4]"
        >
          <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_70%)] blur-2xl" />
          <motion.div
            initial={{ clipPath: "inset(100% 0% 0% 0% round 999px 999px 1.6rem 1.6rem)" }}
            animate={ready ? { clipPath: "inset(0% 0% 0% 0% round 999px 999px 1.6rem 1.6rem)" } : {}}
            transition={{ duration: 1.5, ease, delay: 0.15 }}
            className="relative h-full w-full overflow-hidden rounded-t-[999px] rounded-b-[1.6rem] bg-[#0a0a09] ring-1 ring-white/15">
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.28 }}
              animate={ready ? { scale: 1 } : {}}
              transition={{ duration: 2.1, ease, delay: 0.2 }}
            >
              <SiteImage file="yes.jpg" alt="Al Nasif MD Nirob — web developer and designer" className="h-full w-full object-cover object-[50%_24%] transition-opacity duration-1000" style={{ opacity: pixelOk ? 0.85 : 1 }} />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />
                        <div className="pointer-events-none absolute inset-x-0 top-[13%] h-px bg-white/20" />
          </motion.div>

          <PixelPortrait anchorRef={portraitRef} ready={ready} replay={replay} onResult={setPixelOk} />

          <div className="pointer-events-none absolute inset-x-0 top-[9%] z-40 flex justify-center font-mono text-[8px] uppercase tracking-[0.4em] text-white/60">Since 2010</div>

          {/* floating caption on the frame */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={ready ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 1.4, duration: 0.7, ease }}
            className="absolute -left-10 top-[55%] z-40 hidden -rotate-90 font-mono text-[9px] uppercase tracking-[0.4em] text-white/50 lg:block"
          >
            Web Developer & Designer
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.45, duration: 0.7, ease }}
            className="absolute -right-1 top-[34%] z-40 whitespace-nowrap rounded-full border border-white/20 bg-black/50 px-2.5 py-1.5 font-mono text-[7px] uppercase tracking-[0.14em] text-white/75 backdrop-blur-md md:-right-8 md:text-[8px]"
          >
            Available
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.55, duration: 0.7, ease }}
            className="absolute -left-8 bottom-[40%] z-40 hidden rounded-2xl border border-white/15 bg-black/55 px-4 py-3 backdrop-blur-md lg:block"
          >
            <p className="font-display text-2xl font-extrabold leading-none">12<span className="text-accent">+</span></p>
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">Projects</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* wordmark + meta */}
      <div className="relative z-20 w-full pb-[4vh] pt-40 md:pb-[3vh]">
        <motion.h1
          style={{ y: nameY }}
          aria-label="Nirob"
          onMouseEnter={() => { setHoverName(true); setReplay((r) => r + 1); }}
          onMouseLeave={() => setHoverName(false)}
          onClick={() => setReplay((r) => r + 1)}
          className={`relative flex w-full cursor-pointer select-none items-baseline justify-center overflow-x-clip whitespace-nowrap text-[22vw] md:text-[14rem] lg:text-[18rem] ${nameType}`}
        >
          <span ref={fitRef} className="inline-flex items-baseline" style={{ transform: `scale(${fit})`, transformOrigin: "center" }}>
          <motion.span style={{ x: leftX }} className="inline-flex items-baseline">
            <motion.span
              initial={{ opacity: 0, x: -70, filter: "blur(14px)" }}
              animate={ready ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
              transition={{ delay: 0.35, duration: 1.1, ease }}
              className={`${gradient} ${hoverName ? "drop-shadow-[0_0_60px_rgba(244,242,236,.28)]" : ""} transition-[filter] duration-500`}
            >
              NIR
            </motion.span>
          </motion.span>
          <motion.span
            aria-hidden
            initial={{ scale: 0 }}
            animate={ready ? { scale: 1 } : {}}
            transition={{ delay: 1.25, duration: 0.7, ease }}
            className="mx-1 mb-[0.22em] inline-block h-[0.09em] w-[0.09em] self-end rounded-full bg-accent md:mx-2"
          />
          <motion.span style={{ x: rightX }} className="inline-flex items-baseline">
            <motion.span
              initial={{ opacity: 0, x: 70, filter: "blur(14px)" }}
              animate={ready ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
              transition={{ delay: 0.45, duration: 1.1, ease }}
              className={`${gradient} ${hoverName ? "drop-shadow-[0_0_60px_rgba(244,242,236,.28)]" : ""} transition-[filter] duration-500`}
            >
              OB
            </motion.span>
          </motion.span>
          </span>
        </motion.h1>

        <motion.div
          style={{ opacity: metaOpacity }}
          className="mx-auto flex w-full max-w-[1500px] items-end justify-between gap-3 px-4 pt-2.5 pb-2 md:gap-6 md:px-10 md:pt-4 lg:pr-24"
        >
          <motion.div initial={{ opacity: 0, y: 22 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.15, duration: 0.8, ease }}>
            <p className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.22em] text-white/40 md:text-[9px]">
              <MapPin size={10} className="text-accent" /> Sylhet, Bangladesh
            </p>
            <p className="mt-1 whitespace-nowrap text-[13px] leading-tight text-white sm:text-lg md:mt-1.5 md:text-2xl lg:text-3xl">
              <span className="font-bold">Web Developer </span>
              <span className="font-light italic text-gray-300">— <span className="hidden sm:inline">UI/UX & </span>motion</span>
            </p>
            <p className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 lg:block">Class 10 · BNCC Student Cadet</p>
            <p className="mt-1.5 hidden font-mono text-[8px] uppercase tracking-[0.2em] text-white/25 lg:block">
              {pixelOk ? "Pixel portrait — hover my name to rebuild" : "Assembling the pixels…"}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.25, duration: 0.8, ease }} className="flex shrink-0 items-center gap-1.5 md:gap-4">
            <Magnetic strength={0.4}>
              <button onClick={() => scrollToId("contact")} aria-label="Contact Nirob" className="group grid h-8 w-8 place-items-center rounded-full border border-gray-400/30 bg-black/20 backdrop-blur-md transition-colors hover:border-gray-300/60 hover:bg-white/10 md:h-12 md:w-12">
                <ArrowUpRight size={15} className="text-gray-300 transition-transform duration-300 group-hover:rotate-45 md:h-[18px] md:w-[18px]" />
              </button>
            </Magnetic>
            <Magnetic strength={0.3}>
              <button onClick={() => scrollToId("contact")} className="flex items-center justify-center rounded-full border border-gray-400/30 bg-black/20 px-3 py-1.5 backdrop-blur-md transition-colors hover:border-gray-300/60 hover:bg-white/10 md:px-6 md:py-2.5">
                <span className="text-[11px] font-light italic tracking-wider text-gray-300 md:text-base">Contact</span>
              </button>
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.button
        onClick={() => scrollToId("about")}
        aria-label="Scroll to about"
        style={{ opacity: metaOpacity }}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-7 right-9 z-30 hidden flex-col items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.3em] text-white/35 transition-colors hover:text-white/80 lg:flex"
      >
        Scroll <ArrowDown size={12} className="animate-bounce" />
      </motion.button>
    </section>
  );
}
