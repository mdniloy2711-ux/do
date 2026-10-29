import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Brush, Camera, Code2, LayoutTemplate, PenTool, Smartphone, Terminal, Wrench, type LucideIcon } from "lucide-react";
import { pad, useMediaQuery } from "../lib";
import { Label, Scramble } from "../components/ui";

const items: { title: string; desc: string; kind: string; Icon: LucideIcon }[] = [
  { title: "HTML5", desc: "Semantic Markup & Accessibility", kind: "Skill", Icon: Code2 },
  { title: "CSS3", desc: "Modern Layouts & Animations", kind: "Skill", Icon: Brush },
  { title: "UI/UX Design", desc: "User-Centered Design", kind: "Skill · Service", Icon: PenTool },
  { title: "Responsive Design", desc: "Mobile-First Approach", kind: "Skill · Service", Icon: Smartphone },
  { title: "Web Design", desc: "Service I offer", kind: "Service", Icon: LayoutTemplate },
  { title: "Web Development", desc: "Service I offer", kind: "Service", Icon: Terminal },
  { title: "Website Maintenance", desc: "Service I offer", kind: "Service", Icon: Wrench },
  { title: "Photography", desc: "Hobby & passion", kind: "Interest", Icon: Camera },
];

const N = items.length;
const STEP = 360 / N;

function Panel({
  item,
  i,
  rot,
  radius,
  active,
}: {
  item: (typeof items)[number];
  i: number;
  rot: MotionValue<number>;
  radius: number;
  active: boolean;
}) {
  // facing factor: 1 when panel faces the viewer, -1 when at the back
  const facing = useTransform(rot, (r) => Math.cos(((i * STEP + r) * Math.PI) / 180));
  const opacity = useTransform(facing, [-1, 0, 1], [0.18, 0.45, 1]);
  const brightness = useTransform(facing, [-1, 1], [0.35, 1], { clamp: true });
  const filter = useTransform(brightness, (b) => `brightness(${b})`);
  const { Icon } = item;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: "var(--pw)",
        height: "var(--ph)",
        marginLeft: "calc(var(--pw) / -2)",
        marginTop: "calc(var(--ph) / -2)",
        transform: `rotateY(${i * STEP}deg) translateZ(${radius}px)`,
        opacity,
        filter,
      }}
    >
      <div
        className={`relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.6rem] border p-5 transition-[border-color,box-shadow] duration-500 md:p-7 ${
          active ? "border-accent shadow-[0_0_80px_-10px_var(--accent)]" : "border-white/10"
        }`}
        style={{ background: "linear-gradient(160deg, rgba(24,25,33,.95), rgba(10,10,14,.92))" }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-opacity duration-700"
          style={{ background: "var(--accent)", opacity: active ? 0.35 : 0.06 }}
        />
        <div className="relative flex items-start justify-between">
          <span className="font-mono text-xs text-mute">{pad(i + 1)}</span>
          <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-bone/70">{item.kind}</span>
        </div>
        <div className="relative">
          <span
            className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl transition-colors duration-500 md:h-16 md:w-16 ${
              active ? "bg-accent text-ink" : "bg-white/5 text-accent"
            }`}
          >
            <Icon size={26} />
          </span>
          <h3 className="font-display text-xl font-bold leading-tight md:text-[1.7rem]">{item.title}</h3>
          <p className="mt-1.5 text-xs text-mute md:text-sm">{item.desc}</p>
        </div>
        <span className="pointer-events-none absolute -bottom-5 right-3 font-display text-[6rem] font-extrabold leading-none text-white/[0.04] md:text-[8rem]">
          {pad(i + 1)}
        </span>
      </div>
    </motion.div>
  );
}

export function Skills3D() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.0005 });

  const pw = isDesktop ? 280 : 180;
  const ph = isDesktop ? 340 : 240;
  const radius = Math.round(pw / 2 / Math.tan(Math.PI / N) + (isDesktop ? 80 : 36));

  const rot = useTransform(p, [0.08, 0.92], [0, -(360 - STEP)], { clamp: true });
  const tiltX = useTransform(p, [0, 0.5, 1], [-16, -6, -16]);
  const scale = useTransform(p, [0, 0.1, 0.9, 1], [0.55, 1, 1, 0.8]);
  const stageY = useTransform(p, [0, 0.1], [100, -40]);
  const bgX = useTransform(p, [0, 1], ["12%", "-38%"]);
  const bar = useTransform(p, [0.08, 0.92], [0, 1]);

  const [active, setActive] = useState(0);
  useMotionValueEvent(rot, "change", (r) => setActive(((Math.round(-r / STEP) % N) + N) % N));

  return (
    <section id="skills" ref={ref} className="relative" style={{ height: isDesktop ? "500vh" : "420vh" }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* giant drifting backdrop word */}
        <motion.p
          style={{ x: bgX }}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[34vw] font-extrabold uppercase leading-none text-stroke opacity-[0.07] md:text-[22vw]"
          aria-hidden
        >
          What I do — What I do
        </motion.p>

        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] items-start justify-between gap-6 px-5 pt-28 md:px-10 md:pt-32">
          <div>
            <Label index="02">Skills & Services</Label>
            <h2 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-tight md:text-6xl">
              What I <span className="font-serif font-normal normal-case italic text-accent">do</span>
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-mute md:block">Scroll to spin the ring — every card is something I build, offer or love.</p>
        </div>

        {/* 3D stage */}
        <div className="relative flex-1" style={{ perspective: isDesktop ? 1500 : 1700 }}>
          <motion.div
            className="absolute inset-0"
            style={{ rotateX: tiltX, scale, y: stageY, transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ rotateY: rot, transformStyle: "preserve-3d", ["--pw" as string]: `${pw}px`, ["--ph" as string]: `${ph}px` }}
            >
              {items.map((it, i) => (
                <Panel key={it.title} item={it} i={i} rot={rot} radius={radius} active={active === i} />
              ))}
            </motion.div>
            {/* floor glow */}
            <div
              className="absolute left-1/2 top-1/2 rounded-full opacity-40 blur-2xl"
              style={{
                width: radius * 2.2,
                height: radius * 2.2,
                marginLeft: -radius * 1.1,
                marginTop: -radius * 1.1,
                transform: `rotateX(90deg) translateZ(${-ph / 2 - 30}px)`,
                background: "radial-gradient(circle, var(--accent), transparent 62%)",
              }}
            />
          </motion.div>
        </div>

        {/* HUD */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center gap-5 px-5 pb-8 pr-24 font-mono text-[11px] uppercase tracking-[0.2em] md:px-10 md:pb-10 md:pr-28">
          <span className="tabular-nums text-accent">{pad(active + 1)}</span>
          <div className="relative h-px flex-1 bg-white/10">
            <motion.div className="absolute inset-0 origin-left bg-accent" style={{ scaleX: bar }} />
          </div>
          <span className="tabular-nums text-mute">{pad(N)}</span>
          <span className="hidden w-56 text-right text-bone sm:block">
            <Scramble key={active} text={items[active].title} hover={false} />
          </span>
        </div>
      </div>
    </section>
  );
}
