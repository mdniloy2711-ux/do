import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { nav } from "./data";
import { lockScroll, useSmoothScroll } from "./lib";
import { Cursor, Reveal3D } from "./components/ui";
import Scene3D from "./components/Scene3D";
import { Skills3D } from "./sections/Skills3D";
import { BNCC } from "./sections/BNCC";
import { Beyond } from "./sections/Beyond";
import { BackToTop, ChapterRail, Header, HexToast, Menu, Preloader, ProgressBar, ScrollSpine } from "./components/chrome";
import { CommandPalette } from "./components/CommandPalette";
import { Hero } from "./sections/Hero";
import { About, PersonalInfo } from "./sections/About";
import { Education, FreeFire } from "./sections/FreeFire";
import { Work } from "./sections/Work";
import { Contact, Footer } from "./sections/Contact";

export default function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [palette, setPalette] = useState(false);
  useSmoothScroll();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    lockScroll(!ready);
  }, [ready]);

  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const done = useCallback(() => setReady(true), []);
  const closePalette = useCallback(() => setPalette(false), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <AnimatePresence>{!ready && <Preloader key="preloader" onDone={done} />}</AnimatePresence>
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="grain" aria-hidden />
      <Cursor />
      <ProgressBar />
      <Header active={active} ready={ready} onMenu={() => setMenuOpen(true)} onPalette={() => setPalette(true)} />
      <Menu open={menuOpen} onClose={closeMenu} />
      <CommandPalette open={palette} onClose={closePalette} />

      <Scene3D />
      <main id="main" className="relative z-[1] overflow-x-clip">
        <Hero ready={ready} />
        <About />
        <Skills3D />
        <Reveal3D>
          <PersonalInfo />
        </Reveal3D>
        <BNCC />
        <Beyond />
        <Reveal3D>
          <FreeFire />
        </Reveal3D>
        <Education />
        <Work />
        <Reveal3D>
          <Contact />
        </Reveal3D>
      </main>
      <Footer />

      <ChapterRail active={active} />
      <ScrollSpine />
      <BackToTop />
      <HexToast ready={ready} />
    </>
  );
}
