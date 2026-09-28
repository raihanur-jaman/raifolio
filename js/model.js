/* =====================================================================
   MODEL — the data and state of the app. Never touches the DOM.
   Edit your content here: featured projects, skills, GitHub username.
   ===================================================================== */

const Model = {

  // Live GitHub feed: set this to your username once you create an account
  // (e.g. "your-username") — your repos will then load automatically
  // under "All repositories" on the Projects screen. Leave "" to hide it.
  githubUser: "",

  // Where the contact form delivers (via formsubmit.co relay)
  contactEmail: "raihanuzzaman200@gmail.com",

  // App state (read/written by the Controller, displayed by the View)
  state: {
    screen: "home",        // which screen is showing
    menuIndex: 0,          // selected item on the home menu
    reposLoaded: false,
    skillsBuilt: false,
  },

  // ---- Featured projects (hand-written, shown above the GitHub feed) ----
  // Each card: title, tag + color (the little label), url ("" = not clickable),
  // cta (button text), optional img (assets/projects/<name>.png), desc.
  featured: [
    {
      title: "RASPBERRY PI OSCILLOSCOPE",
      tag: "Hardware", color: "#3dc8ff",
      url: "", cta: "Built with Raspberry Pi 5",
      img: "assets/projects/oscilloscope.png",
      desc: "A digital oscilloscope built on a Raspberry Pi 5 with an ADS1115 16-bit ADC — I²C communication, voltage acquisition, channel selection, and real-time waveform visualization in Python + Matplotlib.",
    },
    {
      title: "CMOS INVERTER ANALYSIS",
      tag: "VLSI", color: "#f1e05a",
      url: "", cta: "Simulated in LTspice",
      img: "assets/projects/cmos.png",
      desc: "CMOS inverter study in LTspice: voltage transfer characteristic, switching behaviour, VOH/VOL/VIH/VIL, and noise margins — plus PMOS/NMOS sizing experiments.",
    },
    {
      title: "FINITE-STATE MACHINES",
      tag: "Digital Design", color: "#00c48a",
      url: "", cta: "Written in Verilog",
      img: "assets/projects/fsm.png",
      desc: "Mealy and Moore FSMs for binary sequence detection in Verilog, with custom testbenches verified in GTKWave.",
    },
    {
      title: "IMAGE PROCESSING LAB",
      tag: "Python", color: "#3572A5",
      url: "", cta: "OpenCV + Matplotlib",
      img: "assets/projects/opencv.png",
      desc: "Image loading, RGB/BGR conversion, rotation, translation, and scaling using Python, OpenCV, and Matplotlib.",
    },
  ],

  // Repo names already shown in "featured" (hidden from the GitHub feed)
  featuredRepoNames: [],

  // Shown if the GitHub API can't be reached
  fallbackRepos: [],

  // Optional thumbnail overrides: repo name → image path.
  // Anything not listed is looked up at assets/projects/<RepoName>.png
  projectImages: {},

  langColors: {
    JavaScript: "#5c5af1", TypeScript: "#3178c6", Python: "#3572A5",
    PHP: "#4F5D95", CSS: "#663399", HTML: "#e34c26",
    "Jupyter Notebook": "#DA5B0B", MATLAB: "#e16737", Java: "#b07219",
    C: "#555", "C++": "#f34b7d",
  },

  // ---- Skills screen ----
  // [name, level 0-100] — the numbers are just for the bars, edit freely.
  skills: [
    { group: "Programming", items: [
      ["Python", 82], ["C / C++", 72],
      ["Verilog", 68], ["8051 Assembly", 55],
    ]},
    { group: "Electronics & Tools", items: [
      ["Raspberry Pi 5", 85], ["LTspice", 80],
      ["GTKWave", 75], ["Keil uVision 5", 65],
      ["OpenCV · NumPy · Matplotlib", 78],
      ["VS Code · Jupyter", 88],
    ]},
    { group: "Spoken Languages", items: [
      ["Bangla (Native)", 100], ["English", 85],
    ]},
  ],

  // ---- Data fetching ----
  async fetchRepos() {
    if (!this.githubUser) return { repos: [], live: false };
    const skip = new Set(this.featuredRepoNames);
    try {
      const res = await fetch(
        `https://api.github.com/users/${this.githubUser}/repos?per_page=100&sort=updated`
      );
      if (!res.ok) throw new Error(res.status);
      const repos = (await res.json()).filter(r => !r.fork && !skip.has(r.name));
      return { repos, live: true };
    } catch {
      return { repos: this.fallbackRepos.filter(r => !skip.has(r.name)), live: false };
    }
  },
};
