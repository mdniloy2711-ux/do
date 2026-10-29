export const profile = {
  name: "Nirob",
  stylized: "ᮘ ɪ ʀ o ʙ ツ",
  fullName: "Al Nasif MD Nirob",
  birth: new Date(2010, 11, 1),
  birthLabel: "December 1, 2010",
  location: "Sylhet, Bangladesh",
  hometown: "Tahirpur, Sunamganj",
  languages: "Bangla (Native), English (Fluent)",
  nationality: "Bangladeshi",
  interests: "Web Development, UI/UX Design, Free Fire E-Sports, Photography",
  tagline:
    "A passionate web developer and designer creating modern, responsive websites with cutting-edge technologies.",
  roles: ["Web Developer", "UI/UX Designer", "Frontend Developer", "Student", "Freelancer"],
  email: "alnasifmdnirob@gmail.com",
  phone: "+880 1870-516299",
  phoneHref: "tel:+8801870516299",
  whatsapp: "https://wa.me/8801870516299",
  github: "https://github.com/Nirob-420",
  instagram: "https://www.instagram.com/nir0b__",
  teamHex: "https://teamhex.netlify.app/",
  // Set to true after you add public/nirob/bncc.jpg (your real cadet photo).
  // While false, no request is made and a designed cadet record is shown.
  cadetPhoto: true,
};

export const nav = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "personal-info", label: "Info" },
  { id: "bncc", label: "Cadet" },
  { id: "freefire", label: "Free Fire" },
  { id: "education", label: "Education" },
  { id: "portfolio", label: "Work" },
  { id: "contact", label: "Contact" },
];

export const about = {
  p1: "I am an enthusiastic web developer and designer, with expertise in building modern, responsive websites and web applications. My journey in web development began several years ago, and since then I have been constantly learning and improving my skills.",
  p2: "I specialize in front-end development using HTML and CSS. I believe in writing clean, efficient code and creating intuitive user experiences that delight users.",
};

export const skills = [
  { title: "HTML5", desc: "Semantic Markup & Accessibility", icon: "code" },
  { title: "CSS3", desc: "Modern Layouts & Animations", icon: "brush" },
  { title: "UI/UX Design", desc: "User-Centered Design", icon: "pen" },
  { title: "Responsive Design", desc: "Mobile-First Approach", icon: "phone" },
] as const;

export const stats = [
  { value: 12, suffix: "+", label: "Projects Completed" },
  { value: 3, suffix: "", label: "Years of Experience" },
];

export const story = (age: number) => [
  `Hi! My name is Nirob, and I'm ${age} years old. I am now reading in class 10 at JCPSC and proudly serve as a BNCC cadet. I always try to be a good student and work hard to achieve my goals. I come from Tahirpur, Sunamganj, a place I'm really proud of.`,
  "My hobbies are photography and cycling, which help me see the world from new perspectives and enjoy nature. My biggest dream is to become an engineer and travel the world to explore new places and learn new things. I believe that with hard work and dedication, I can make all my dreams come true.",
];

export const traits = ["BNCC Cadet", "Photography", "Cycling", "Future Engineer", "World Traveller", "E-Sports"];

export const clips = [
  {
    id: "T4bSZyN__D4",
    title: "Squad Wipe in Tournament Match",
    desc: "Eliminated an entire squad solo with perfect timing and positioning.",
    views: "12K",
    likes: "1.2K",
  },
  {
    id: "tmQrSzo28RU",
    title: "Clutch Victory",
    desc: "Final moments of a ranked match with a spectacular finish.",
    views: "8.7K",
    likes: "950",
  },
  {
    id: "WSIrh732oR0",
    title: "Best Move",
    desc: "Strategic gameplay showing advanced tactics and teamwork.",
    views: "15K",
    likes: "1.8K",
  },
];

export const education = [
  {
    years: "2016 — 2022",
    title: "Primary Education",
    place: "Rangpur Cantonment Public School and College",
    desc: "Completed my primary education with excellent academic records and participated in various extracurricular activities.",
  },
  {
    years: "2022 — Present",
    title: "High School",
    place: "Science Stream — Jalalabad Cantonment Public School and College",
    desc: "Currently reading in Class 10 — Science stream — at Jalalabad Cantonment Public School and College, with a focus on Science and Mathematics.",
  },
  {
    years: "2022 — 2025",
    title: "Online Courses",
    place: "Web Development & Design — Various Platforms",
    desc: "Completed numerous online courses on web development, UI/UX design, and programming from platforms like Coursera, Udemy, and freeCodeCamp.",
  },
];

export const projects = [
  {
    title: "TEAM HEX",
    desc: "Professional esports & team portfolio featuring interactive roster displays, dark mode aesthetic, and custom motion elements.",
    img: "hex.jpg",
    cat: "Website",
    slug: "teamhex",
    year: "2025",
    tags: ["Esports", "UI/UX", "Roster Portal", "Responsive"],
    role: "Lead Frontend & Design",
  },
  {
    title: "Advance IT, Sylhet",
    desc: "Comprehensive web platform for Sylhet's leading IT training institute, showcasing course syllabi, student admissions, and resource hubs.",
    img: "advance.jpg",
    cat: "Website",
    slug: "advenceit",
    year: "2024",
    tags: ["Education", "Course Hub", "Admissions", "Sylhet IT"],
    role: "Web Design & Development",
  },
  {
    title: "Sylhet Model Nursing",
    desc: "Academic portal for nursing and midwifery students featuring program overviews, notices, faculty directory, and clean typography.",
    img: "smnc.jpg",
    cat: "Website",
    slug: "smnc",
    year: "2024",
    tags: ["College Portal", "Healthcare", "Academics", "Clean UI"],
    role: "UI Design & Frontend",
  },
  {
    title: "Parallax Scroll Animation",
    desc: "Experimental showcase implementing multi-layered parallax scrolling, depth-of-field effects, and performance-tuned CSS transformations.",
    img: "animation.jpg",
    cat: "UI / Motion",
    slug: "nbscroll",
    year: "2024",
    tags: ["Parallax Motion", "Depth Effects", "CSS Physics", "Interactive"],
    role: "Creative Development",
  },
  {
    title: "TEAM HYPER Guild",
    desc: "Competitive gaming community portal with guild member rankings, tournament brackets, clan media archives, and match stats.",
    img: "hyper.jpg",
    cat: "Website",
    slug: "NIROB-PROJECT-",
    year: "2024",
    tags: ["Guild Hub", "Tournament", "Esports Clan", "Dark UI"],
    role: "Frontend Development",
  },
  {
    title: "Name Initial Matchmaker",
    desc: "Interactive compatibility algorithm inspired by e-commerce search UX, featuring animated scoring bars and real-time computation.",
    img: "wow.jpg",
    cat: "Web App",
    slug: "gb",
    year: "2024",
    tags: ["Algorithm", "Interactive UX", "JavaScript", "Micro-Interactions"],
    role: "Frontend & Logic",
  },
  {
    title: "Advanced NIROB Animation",
    desc: "Dynamic motion identity and typographic choreography exploring particle transitions, SVG morphing, and fluid layout pacing.",
    img: "nb.jpg",
    cat: "UI / Motion",
    slug: "nb",
    year: "2024",
    tags: ["Typographic Motion", "SVG Morph", "Particle Physics", "Showcase"],
    role: "Motion Design",
  },
  {
    title: "nb codes",
    desc: "Hacker-themed interactive coding laboratory featuring terminal emulation, syntax highlights, command prompts, and retro CRT vibes.",
    img: "hake.jpg",
    cat: "Web App",
    slug: "nbHacker",
    year: "2024",
    tags: ["Cyber Terminal", "Matrix Effects", "Code Playground", "Retro CRT"],
    role: "Creative Engineering",
  },
  {
    title: "Birthday Wish",
    desc: "Delightful celebration website engineered with physics-based confetti bursts, animated greeting cards, ambient sound, and floating balloons.",
    img: "birthday.jpg",
    cat: "Website",
    slug: "Birthday-gift",
    year: "2024",
    tags: ["Celebration", "Confetti Canvas", "Sound FX", "Interactive Cards"],
    role: "Full Build & Motion",
  },
].map((p) => ({
  ...p,
  live: `https://nirob-420.github.io/${p.slug}/`,
  code: `https://github.com/nirob-420/${p.slug}`,
}));

export const services = ["Web Design", "Web Development", "UI/UX Design", "Responsive Design", "Website Maintenance"];

export const accents = [
  { name: "Electric Orange", value: "#ff5b2e" },
  { name: "Crest Gold", value: "#f4b93e" },
  { name: "Cyber Blue", value: "#2e6bff" },
  { name: "Mint Emerald", value: "#2fe6a8" },
  { name: "Pure Ivory", value: "#f4f2ec" },
];
