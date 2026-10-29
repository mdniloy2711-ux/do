import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Check, Copy, Mail, MapPin, Phone, Send } from "lucide-react";
import { nav, profile, services } from "../data";
import { ease, scrollToId, sylhetTime, useNow } from "../lib";
import { ChapterMark, FadeUp, GithubIcon, InstagramIcon, Label, Magnetic, RollText, ScrollFlip, SiteImage, SplitText, VelocityMarquee, WhatsappIcon } from "../components/ui";

function ContactRow({
  icon,
  label,
  value,
  href,
  copy,
  i,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  copy?: string;
  i: number;
}) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    if (!copy) return;
    try {
      await navigator.clipboard.writeText(copy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease, delay: i * 0.08 }}
      className="group relative overflow-hidden border-b border-white/10"
    >
      <span className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" />
      <div className="relative flex items-center gap-5 px-2 py-6 transition-colors duration-500 group-hover:text-ink md:px-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 transition-colors duration-500 group-hover:border-ink/30">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors group-hover:text-ink/60">{label}</p>
          {href ? (
            <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block truncate font-display text-lg font-semibold md:text-2xl">
              {value}
            </a>
          ) : (
            <p className="truncate font-display text-lg font-semibold md:text-2xl">{value}</p>
          )}
        </div>
        {copy ? (
          <button onClick={doCopy} aria-label={`Copy ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-ink/30">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        ) : (
          href && <ArrowUpRight size={20} className="shrink-0 transition-transform duration-500 group-hover:rotate-45" />
        )}
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-bone"
            >
              Copied!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ContactForm() {
  const [sent, setSent] = useState<null | "whatsapp" | "email">(null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const via = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.dataset.via === "email" ? "email" : "whatsapp";
    const name = String(data.get("name"));
    const email = String(data.get("email"));
    const subject = String(data.get("subject"));
    const message = String(data.get("message"));
    if (via === "whatsapp") {
      const text = `Hi Nirob! I'm ${name} (${email}).\n\n*${subject}*\n${message}`;
      window.open(`${profile.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${message}\n\n— ${name} (${email})`)}`;
    }
    setSent(via);
    form.reset();
    window.setTimeout(() => setSent(null), 5000);
  };

  const fields = [
    { name: "name", label: "Your Name", type: "text" },
    { name: "email", label: "Your Email", type: "email" },
    { name: "subject", label: "Subject", type: "text" },
  ];

  return (
    <FadeUp delay={0.1} className="relative rounded-[2rem] border border-white/10 bg-ink p-6 md:p-10">
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-ink/95 p-8 text-center backdrop-blur"
          >
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="grid h-20 w-20 place-items-center rounded-full bg-accent text-ink">
              <Check size={36} />
            </motion.span>
            <p className="font-display text-3xl font-bold">Thank you!</p>
            <p className="max-w-xs text-mute">
              Your message is ready in {sent === "whatsapp" ? "WhatsApp" : "your email app"} — just hit send. I'll get back to you soon.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.slice(0, 2).map((f) => (
            <div key={f.name} className="relative">
              <input id={f.name} name={f.name} type={f.type} required placeholder=" " className="field" />
              <label htmlFor={f.name} className="field-label">{f.label}</label>
            </div>
          ))}
        </div>
        <div className="relative">
          <input id="subject" name="subject" type="text" required placeholder=" " className="field" />
          <label htmlFor="subject" className="field-label">Subject</label>
        </div>
        <div className="relative">
          <textarea id="message" name="message" required rows={4} placeholder=" " className="field resize-none" />
          <label htmlFor="message" className="field-label">Your Message</label>
        </div>
        <div className="flex flex-col gap-3 pt-6 sm:flex-row">
          <button type="submit" data-via="whatsapp" className="group flex flex-1 items-center justify-center gap-3 rounded-full bg-accent px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            <WhatsappIcon className="h-4 w-4" />
            <RollText>Send via WhatsApp</RollText>
          </button>
          <button type="submit" data-via="email" className="group flex flex-1 items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-bone hover:bg-bone hover:text-ink">
            <Send size={14} />
            <RollText>Send via Email</RollText>
          </button>
        </div>
      </form>
    </FadeUp>
  );
}

export function Contact() {
  return (
    <section id="contact" className="relative z-10 overflow-hidden rounded-t-[2.5rem] bg-panel md:rounded-t-[4rem]">
      <div className="pointer-events-none absolute -right-60 -top-60 h-[50rem] w-[50rem] rounded-full bg-accent/10 blur-[160px]" />
      <div className="relative mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <Label index="09">Get In Touch</Label>
        <ChapterMark index="09" title="Start something worth shipping" meta="Contact / Sylhet, BD" className="-mx-5 mt-10 md:-mx-10" />

        <p className="mt-5 max-w-md text-sm leading-relaxed text-mute md:text-base">
          Have a project, a collab or just want to say hi? Email <a href={`mailto:${profile.email}`} className="text-bone link-underline">{profile.email}</a> or DM <a href={profile.instagram} target="_blank" rel="noreferrer" className="text-bone link-underline">@nir0b__</a> on Instagram.
        </p>

        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-display text-[16vw] font-extrabold uppercase leading-[0.82] tracking-tight lg:text-[10vw]">
            <ScrollFlip>Let's work</ScrollFlip>
            <ScrollFlip from={-110}>
              <span className="font-serif font-normal normal-case italic text-accent">together</span>
            </ScrollFlip>
          </h2>
          <Magnetic strength={0.5} className="self-end lg:mb-6">
            <a
              href={`mailto:${profile.email}`}
              className="group relative grid h-40 w-40 place-items-center overflow-hidden rounded-full bg-accent text-ink md:h-52 md:w-52"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0" />
              <span className="relative flex flex-col items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em]">
                <ArrowUpRight size={30} className="transition-transform duration-500 group-hover:rotate-45" />
                Say Hello
              </span>
            </a>
          </Magnetic>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 [&>*]:min-w-0">
          <div className="min-w-0">
            <ContactRow i={0} icon={<Mail size={18} />} label="Email" value={profile.email} href={`mailto:${profile.email}`} copy={profile.email} />
            <ContactRow i={1} icon={<Phone size={18} />} label="Phone" value={profile.phone} href={profile.phoneHref} copy={profile.phone} />
            <ContactRow i={2} icon={<WhatsappIcon className="h-[18px] w-[18px]" />} label="WhatsApp" value="Message Me" href={profile.whatsapp} />
            <ContactRow i={3} icon={<InstagramIcon className="h-[18px] w-[18px]" />} label="Instagram" value="@nir0b__" href={profile.instagram} />
            <ContactRow i={4} icon={<MapPin size={18} />} label="Location" value={profile.location} />
          </div>
          <ContactForm />
        </div>

        <FadeUp className="relative mt-16 overflow-hidden rounded-[2rem] border border-white/10">
          <iframe
            title="Sylhet map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.518722909107!2d91.989311!3d24.93416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDU2JzAzLjAiTiA5McKwNTknMjEuNSJF!5e0!3m2!1sen!2sbd!4v1620000000000!5m2!1sen!2sbd"
            className="h-[320px] w-full md:h-[420px]"
            style={{ border: 0, filter: "grayscale(1) invert(0.92) contrast(0.9) brightness(0.95)" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3 rounded-full bg-ink/80 py-2 pl-2 pr-5 backdrop-blur">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-ink"><MapPin size={14} /></span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{profile.location}</span>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

export function Footer() {
  const now = useNow();
  const year = now.getFullYear();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-35%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const bigY = useTransform(scrollYProgress, [0.4, 1], ["40%", "0%"]);
  return (
    <footer ref={ref} className="relative z-[1] overflow-hidden bg-ink">
      <motion.div style={{ y, scale, transformOrigin: "50% 100%" }}>
      <div className="border-y border-white/10 py-5">
        <VelocityMarquee baseVelocity={-2} items={["Let's build something amazing", "Available for freelance", "Web Developer & Designer"]} className="font-display text-2xl font-bold uppercase text-bone/80 md:text-4xl" />
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 pb-10 pt-20 md:grid-cols-2 md:px-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <SiteImage file="hii.png" alt="" className="h-12 w-12 rounded-full object-cover" />
            <span className="font-display text-xl font-bold">{profile.stylized}</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-mute">{profile.tagline}</p>
          <div className="mt-6 flex gap-3">
            {[
              { href: profile.github, icon: <GithubIcon className="h-4 w-4" />, l: "GitHub" },
              { href: profile.instagram, icon: <InstagramIcon className="h-4 w-4" />, l: "Instagram" },
              { href: profile.whatsapp, icon: <WhatsappIcon className="h-4 w-4" />, l: "WhatsApp" },
            ].map((s) => (
              <Magnetic key={s.l} strength={0.5}>
                <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.l} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 transition-colors hover:border-accent hover:bg-accent hover:text-ink">
                  {s.icon}
                </a>
              </Magnetic>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">Quick Links</p>
          <ul className="space-y-2.5">
            {nav.map((n) => (
              <li key={n.id}>
                <button onClick={() => scrollToId(n.id)} className="group flex items-center gap-2 text-bone/80 transition-colors hover:text-accent">
                  <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-4" />
                  {n.id === "personal-info" ? "Personal Info" : n.id === "portfolio" ? "Portfolio" : n.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">Services</p>
          <ul className="space-y-2.5 text-bone/80">
            {services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">Local Time</p>
          <p className="font-display text-3xl font-bold tabular-nums">{sylhetTime(now)}</p>
          <p className="mt-1 text-sm text-mute">Sylhet, Bangladesh (GMT+6)</p>
          <a href={`mailto:${profile.email}`} className="mt-6 block break-all text-sm text-bone/80 underline-offset-4 hover:text-accent hover:underline">{profile.email}</a>
        </div>
      </div>

      <div className="relative select-none px-2">
        <motion.p style={{ y: bigY }} className="text-center font-display text-[27vw] font-extrabold uppercase leading-[0.78] tracking-[-0.05em] text-bone [mask-image:linear-gradient(to_bottom,black_25%,transparent_95%)]">
          <SplitText text="NIROB" stagger={0.08} />
        </motion.p>
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 border-t border-white/10 px-5 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-mute md:flex-row md:items-center md:justify-between md:px-10">
        <p>© {year} Nirob. All Rights Reserved.</p>
        <p>Designed & coded by Nirob in Sylhet</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <button onClick={() => scrollToId("home")} className="group flex items-center gap-2 text-left hover:text-accent">
              <RollText>Back to top ↑</RollText>
            </button>
          </div>
        </div>
      </div>
      </motion.div>
    </footer>
  );
}
