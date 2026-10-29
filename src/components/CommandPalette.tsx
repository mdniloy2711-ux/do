import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CornerDownLeft, Mail, Palette, Search, X } from "lucide-react";
import { accents, nav, profile } from "../data";
import { ease, lockScroll, scrollToId } from "../lib";
import { GithubIcon, InstagramIcon, WhatsappIcon } from "./ui";

type Item = {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Contact" | "Accent" | "Project";
  icon?: React.ReactNode;
  run: () => void;
};

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [accent, setAccent] = useState(() => localStorage.getItem("nirob-accent-v2") || accents[0].value);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("nirob-accent-v2", accent);
  }, [accent]);

  useEffect(() => {
    lockScroll(open);
    if (open) {
      setQuery("");
      setIndex(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => {
      onClose();
      window.setTimeout(() => scrollToId(id), 220);
    };
    return [
      ...nav.map((n) => ({
        id: `nav-${n.id}`,
        label: n.id === "personal-info" ? "Personal Info" : n.id === "bncc" ? "BNCC Cadet" : n.label,
        hint: "Section",
        group: "Navigate" as const,
        icon: <ArrowUpRight size={14} />,
        run: () => go(n.id),
      })),
      {
        id: "contact-section",
        label: "Start a project",
        hint: "Contact",
        group: "Navigate" as const,
        icon: <ArrowUpRight size={14} />,
        run: () => go("contact"),
      },
      {
        id: "email",
        label: profile.email,
        hint: "Copy email",
        group: "Contact" as const,
        icon: <Mail size={14} />,
        run: () => {
          navigator.clipboard?.writeText(profile.email).catch(() => {});
          window.location.href = `mailto:${profile.email}`;
          onClose();
        },
      },
      {
        id: "whatsapp",
        label: "WhatsApp Nirob",
        hint: "Open chat",
        group: "Contact" as const,
        icon: <WhatsappIcon className="h-3.5 w-3.5" />,
        run: () => {
          window.open(profile.whatsapp, "_blank");
          onClose();
        },
      },
      {
        id: "github",
        label: "GitHub — Nirob-420",
        hint: "9 repositories",
        group: "Project" as const,
        icon: <GithubIcon className="h-3.5 w-3.5" />,
        run: () => {
          window.open(profile.github, "_blank");
          onClose();
        },
      },
      {
        id: "instagram",
        label: "Instagram — @nir0b__",
        hint: "Photography",
        group: "Project" as const,
        icon: <InstagramIcon className="h-3.5 w-3.5" />,
        run: () => {
          window.open(profile.instagram, "_blank");
          onClose();
        },
      },
      ...accents.map((a) => ({
        id: `accent-${a.value}`,
        label: `Theme — ${a.name}`,
        hint: a.value,
        group: "Accent" as const,
        icon: <Palette size={14} />,
        run: () => setAccent(a.value),
      })),
    ];
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.hint} ${i.group}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => setIndex(0), [query]);

  const activate = (item?: Item) => {
    if (!item) return;
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      activate(filtered[index]);
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const groups = ["Navigate", "Contact", "Project", "Accent"] as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[210] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.98, rotateX: -8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0a]/95 shadow-[0_40px_120px_rgba(0,0,0,.8)]"
            style={{ transformPerspective: 1200 }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search size={16} className="text-mute" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search sections, contact, themes…"
                className="flex-1 bg-transparent font-sans text-[15px] text-bone outline-none placeholder:text-mute/70"
                aria-label="Search commands"
              />
              <button onClick={onClose} aria-label="Close command palette" className="rounded-full p-1 text-mute transition-colors hover:text-bone">
                <X size={16} />
              </button>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto px-2 py-2">
              {filtered.length === 0 && <p className="px-3 py-8 text-center text-sm text-mute">No results. Try “contact” or “theme”.</p>}
              {groups.map((g) => {
                const groupItems = filtered.filter((i) => i.group === g);
                if (!groupItems.length) return null;
                return (
                  <div key={g} className="mb-1">
                    <p className="px-3 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-mute/70">{g}</p>
                    {groupItems.map((item) => {
                      const globalIndex = filtered.indexOf(item);
                      const active = globalIndex === index;
                      return (
                        <button
                          key={item.id}
                          data-idx={globalIndex}
                          onMouseEnter={() => setIndex(globalIndex)}
                          onClick={() => activate(item)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            active ? "bg-white/10 text-bone" : "text-bone/75 hover:bg-white/5"
                          }`}
                        >
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border ${active ? "border-white/30 bg-white/10" : "border-white/10"}`}>
                            {item.icon}
                          </span>
                          <span className="flex-1 truncate text-sm">{item.label}</span>
                          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-mute">{item.id.startsWith("accent") ? <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-white/30" style={{ background: item.hint }} />{item.hint}</span> : item.hint}</span>
                          {active && <CornerDownLeft size={12} className="shrink-0 text-mute" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-mute">
              <span className="flex items-center gap-3">
                <span>↑ ↓ navigate</span>
                <span>↵ select</span>
                <span>esc close</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-accent" /> {accents.find((a) => a.value === accent)?.name ?? "Ivory"} theme
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
