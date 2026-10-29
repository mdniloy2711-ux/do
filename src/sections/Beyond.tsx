import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeftRight, ArrowUpRight, GripVertical, Sparkles } from "lucide-react";
import { ease } from "../lib";
import { FadeUp, Label, SiteImage } from "../components/ui";

const deck = [
  { file: "bncc.jpg", title: "In uniform", sub: "BNCC Cadet · Service & discipline", tag: "01", color: "#e53935", fit: "cover" },
  { file: "photo.jpg", title: "Beyond the frame", sub: "Photography · See the world differently", tag: "02", color: "#f4f2ec", fit: "cover" },
  { file: "nb.jpg", title: "NIROB in motion", sub: "Animation showcase · The build", tag: "03", color: "#f4b93e", fit: "cover" },
  { file: "yes.jpg", title: "The developer", sub: "Portrait · Sylhet, Bangladesh", tag: "04", color: "#f4f2ec", fit: "cover" },
  { file: "ff.png", title: "Booyah", sub: "Free Fire · TEAM HEX e-sports", tag: "05", color: "#2fe6a8", fit: "contain" },
  { file: "hii.png", title: "The crest", sub: "Identity · ᮘ ɪ ʀ o ʙ ツ", tag: "06", color: "#d8d6cf", fit: "contain" },
] as const;

export function Beyond() {
  const [order, setOrder] = useState(() => deck.map((_, i) => i));
  const top = order[order.length - 1];
  const shuffle = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const rotX = useTransform(smy, [-0.5, 0.5], [8, -8]);
  const rotY = useTransform(smx, [-0.5, 0.5], [-10, 10]);

  return (
    <section id="beyond" className="relative overflow-hidden py-24 md:py-36">
      {/* ambient bleed of the top card */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={deck[top].file}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 0.16, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease }}
          className="pointer-events-none absolute inset-0"
        >
          <SiteImage file={deck[top].file} alt="" className="h-full w-full object-cover blur-2xl" aria-hidden />
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" />

      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
          <div>
            <Label index="05">Beyond the uniform</Label>
            <h2 className="mt-8 font-display text-6xl font-extrabold uppercase leading-[0.86] tracking-tight md:text-8xl">
              More than
              <br />
              <span className="font-serif font-normal normal-case italic text-accent">pixels.</span>
            </h2>
            <FadeUp delay={0.1}>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-bone/70">
                A cadet, a photographer, an e-sports player, a student — one person, many uniforms. Drag the deck to flip through the parts of me that don't fit in a code editor.
              </p>
            </FadeUp>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {[
                [`0${deck.length}`, "Roles in play"],
                ["∞", "Curiosity"],
                ["1", "Standard"],
              ].map(([v, l]) => (
                <FadeUp key={l} delay={0.2} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-display text-3xl font-extrabold text-accent">{v}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-mute">{l}</p>
                </FadeUp>
              ))}
            </div>

            <div className="mt-10 hidden items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-mute md:flex">
              <span className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2">
                <GripVertical size={13} className="text-accent" /> Drag the top card
              </span>
              <span className="flex items-center gap-2">
                <ArrowLeftRight size={13} /> Shuffle the deck
              </span>
            </div>
          </div>

          {/* 3D deck */}
          <div
            className="relative mx-auto flex h-[480px] w-full max-w-[430px] items-center justify-center sm:h-[560px]"
            style={{ perspective: 1400 }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set((e.clientX - r.left) / r.width - 0.5);
              my.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onMouseLeave={() => { mx.set(0); my.set(0); }}
          >
            <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }} className="relative h-full w-[78%]">
              {order.map((ci) => {
                const card = deck[ci];
                const pos = order.indexOf(ci);
                const depth = order.length - 1 - pos;
                const isTop = depth === 0;
                return (
                  <motion.div
                    key={card.file}
                    className="absolute inset-0"
                    style={{ zIndex: pos }}
                    animate={{
                      y: depth * -16,
                      scale: 1 - depth * 0.045,
                      rotate: depth === 0 ? 0 : (ci % 2 ? 1 : -1) * (2.5 + depth * 2.2),
                      x: depth === 0 ? 0 : (ci % 2 ? 1 : -1) * depth * 7,
                      opacity: depth > 3 ? 0 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    drag={isTop}
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.75}
                    whileDrag={{ scale: 1.04, rotate: 0, cursor: "grabbing", zIndex: 60 }}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 450) shuffle();
                    }}
                    onClick={() => { if (!isTop) shuffle(); }}
                    data-cursor={isTop ? "Drag" : undefined}
                  >
                    <div
                      className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.8rem] border border-white/15 p-3 shadow-[0_40px_90px_-20px_rgba(0,0,0,.85)]"
                      style={{ background: "linear-gradient(155deg,#1b1b1a,#0b0b0a)" }}
                    >
                      <div className="relative flex-1 overflow-hidden rounded-[1.3rem] bg-panel">
                        <SiteImage
                          file={card.file}
                          alt={card.title}
                          draggable={false}
                          className={`h-full w-full select-none ${card.fit === "cover" ? "object-cover img-mono" : "object-contain p-8 img-mono"}`}
                          style={card.fit === "contain" ? { background: `radial-gradient(circle at 50% 40%, ${card.color}44, #0b0b0a 70%)` } : undefined}
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                        <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] backdrop-blur">{card.tag} / 0{deck.length}</span>
                        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-ink/60 backdrop-blur">
                          <ArrowUpRight size={14} />
                        </span>
                        <div className="absolute inset-x-4 bottom-4">
                          <p className="font-serif text-3xl italic leading-none md:text-4xl">{card.title}</p>
                          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/60">{card.sub}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2 py-2.5">
                        <div className="flex gap-1">
                          {Array.from({ length: deck.length }).map((_, k) => (
                            <span key={k} className="h-1 rounded-full transition-all" style={{ width: k === ci ? 18 : 10, background: k === ci ? card.color : "#ffffff22" }} />
                          ))}
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mute">
                          <Sparkles size={10} className="mr-1 inline text-accent" /> Drag me
                        </span>
                      </div>
                      <span className="absolute right-0 top-0 h-20 w-20 rounded-bl-[1.5rem]" style={{ background: card.color, opacity: 0.85 }} />
                      <span className="absolute right-4 top-4 z-10 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-ink">Nirob</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
            <button onClick={shuffle} aria-label="Shuffle photos" className="absolute -bottom-2 right-2 grid h-12 w-12 place-items-center rounded-full bg-accent text-ink shadow-[0_10px_40px_-5px_var(--accent)] transition-transform hover:scale-110">
              <ArrowLeftRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
