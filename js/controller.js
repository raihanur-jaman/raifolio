/* =====================================================================
   CONTROLLER — listens to the user, updates the Model, tells the View.
   ===================================================================== */

const Controller = {

  transitioning: false,

  init() {
    View.init();
    this.bindMenu();
    this.bindKeyboard();
    this.bindAudio();
    this.syncAudioButton();
    this.bindEmailChips();
    this.bindContactForm();
    this.bindTouchGestures();
  },

  /* ---------- Email chip: copy address + open Gmail ---------- */
  bindEmailChips() {
    document.querySelectorAll(".contact-chip[data-copy]").forEach(chip => {
      chip.addEventListener("click", e => {
        const email = chip.dataset.copy;
        const openGmail = () =>
          window.open("https://mail.google.com", "_blank", "noopener");
        // Clipboard unavailable (file:// or old browser): the anchor's own
        // Gmail link handles the click — nothing else to do here.
        if (!navigator.clipboard || !window.isSecureContext) return;
        e.preventDefault();  // we open Gmail ourselves after copying
        navigator.clipboard.writeText(email).then(() => {
          this.toast(`✓ ${email} copied — opening Gmail…`);
          setTimeout(openGmail, 600);
        }).catch(() => {
          openGmail();  // clipboard blocked: still open Gmail without copying
        });
      });
    });
  },

  // Small on-screen confirmation, styled like the site's paper cards
  toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
  },

  /* ---------- Contact form (relayed via formsubmit.co, mailto fallback) ---------- */
  bindContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = document.getElementById("form-status");
    const btn = form.querySelector(".form-send");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) return;  // honeypot caught a bot
      if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
        status.textContent = "Fill in all three fields first.";
        return;
      }
      btn.disabled = true;
      status.textContent = "Sending…";
      try {
        // Abort if the relay doesn't answer within 12s → mailto fallback
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 12000);
        const res = await fetch(`https://formsubmit.co/ajax/${Model.contactEmail}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            _replyto: data.email,     // "reply" in the visitor's mail app goes to them
            message: data.message,
            _subject: `Portfolio message from ${data.name}`,
            _captcha: "false",        // AJAX endpoint: skip the captcha step
          }),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        const out = await res.json().catch(() => ({}));
        // FormSubmit answers {success:"true"} — HTTP 200 alone isn't proof,
        // so an explicit success:"false" must route to the fallback too.
        if (!res.ok || out.success === "false") throw new Error(out.message || res.status);
        status.textContent = "Sent! I'll get back to you soon.";
        form.reset();
        this.play();
      } catch {
        // relay unreachable: open the visitor's own mail app instead
        status.textContent = "Couldn't reach the relay, opening your email app instead…";
        const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
        const body = encodeURIComponent(`${data.message}\n\nReply to: ${data.email}`);
        location.href = `mailto:${Model.contactEmail}?subject=${subject}&body=${body}`;
      } finally {
        btn.disabled = false;
      }
    });
  },

  /* ---------- Navigation ---------- */
  goTo(screen) {
    if (this.transitioning || screen === Model.state.screen) return;
    this.transitioning = true;
    this.play();

    View.wipe(
      () => {                       // mid-wipe: swap screens while covered
        Model.state.screen = screen;
        View.showScreen(screen);
        if (screen === "projects") this.loadProjects();
        if (screen === "skills") this.loadSkills();   // bars animate while still covered
      },
      () => { this.transitioning = false; }
    );
  },

  select(index) {
    const n = View.els.menuItems.length;
    const next = (index + n) % n;
    if (next !== Model.state.menuIndex) this.play();
    Model.state.menuIndex = next;
    View.setMenuSelection(next);
  },

  /* ---------- Screen data loading ---------- */
  async loadProjects() {
    View.renderFeatured(Model.featured);
    if (!Model.githubUser) {   // no GitHub account yet — hide the live feed
      View.hideRepoFeed();
      return;
    }
    if (Model.state.reposLoaded) return;
    const { repos, live } = await Model.fetchRepos();
    const status = live
      ? `${repos.length} repositories · live from GitHub`
      : "GitHub API unavailable right now";
    View.renderRepos(repos, status, Model);
    Model.state.reposLoaded = true;
  },

  loadSkills() {
    if (!Model.state.skillsBuilt) {
      View.renderSkills(Model.skills);
      Model.state.skillsBuilt = true;
    }
    View.animateSkillBars();
  },

  /* ---------- Sound (browsers block audio until first user gesture) ---------- */
  play() {
    if (this.audioUnlocked) View.playSelect();
  },

  /* ---------- Audio: sfx, background music, mute button ---------- */
  audioUnlocked: false,
  muted: true,   // music starts muted; the visitor opts in via the 🔊 button
  unlockedAt: 0,

  syncAudioButton() {
    const button = document.getElementById("audio-toggle");
    if (!button) return;
    button.textContent = this.muted ? "🔇" : "🔊";
    button.setAttribute("aria-label", this.muted ? "Turn audio on" : "Mute audio");
  },

  applyMute() {
    const music = document.getElementById("bg-music");
    const video = document.getElementById("home-video");
    if (music) music.muted = this.muted;
    if (video) video.muted = this.muted;
    if (!this.muted) {
      if (music) music.play().catch(() => {});
      if (video) video.play().catch(() => {});
    }
  },

  // First user gesture anywhere unlocks audio (browser autoplay policy).
  // It only "unlocks" playback — music stays muted until the visitor
  // turns it on with the 🔊 button.
  startAudio() {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
    this.unlockedAt = Date.now();
    const music = document.getElementById("bg-music");
    if (music) music.volume = 0.35;
    const video = document.getElementById("home-video");
    if (video) video.volume = 0.5;
    this.applyMute();
    this.syncAudioButton();
  },

  bindAudio() {
    addEventListener("pointerdown", () => this.startAudio(), { once: true, capture: true });
    addEventListener("keydown", () => this.startAudio(), { once: true, capture: true });

    const button = document.getElementById("audio-toggle");
    if (!button) return;
    button.addEventListener("click", e => {
      e.stopPropagation();
      // If this click is the very gesture that enabled audio, it means
      // "turn it on" — never toggle it straight back off again.
      if (!this.audioUnlocked || Date.now() - this.unlockedAt < 300) {
        this.startAudio();
        this.muted = false;
        this.applyMute();
        this.syncAudioButton();
        return;
      }
      this.muted = !this.muted;
      this.applyMute();
      this.syncAudioButton();
    });
  },

  /* ---------- Input bindings ---------- */
  bindMenu() {
    const isTouch = matchMedia("(pointer:coarse)").matches;
    View.els.menuItems.forEach((item, i) => {
      if (!isTouch) item.addEventListener("mouseenter", () => this.select(i));
      item.addEventListener("click", () => this.goTo(item.dataset.target));
    });

    document.querySelectorAll("[data-back]").forEach(b =>
      b.addEventListener("click", () => this.goTo("home")));

    // Clicking the name always takes you home
    document.getElementById("big-name").addEventListener("click", () => {
      if (Model.state.screen !== "home") this.goTo("home");
      else this.play();
    });
  },

  /* ---------- Touch gestures ----------
     - Tapping a menu item selects AND confirms it (no hover on touch).
     - Swipe right anywhere on a sub-screen goes back to the menu.
       (Only when the gesture starts on the background/cards — never
       inside form fields, and never while a swipe would scroll.) */
  bindTouchGestures() {
    if (!matchMedia("(pointer:coarse)").matches) return;

    // Tapping an unselected menu item plays the select sound before navigating
    View.els.menuItems.forEach(item => {
      item.addEventListener("pointerdown", () => {
        const i = View.els.menuItems.indexOf(item);
        if (i !== Model.state.menuIndex) this.select(i);
      });
    });

    let startX = null, startY = null, startT = 0, tracking = false;
    const stage = document.getElementById("stage");
    stage.addEventListener("touchstart", e => {
      if (e.touches.length !== 1) { tracking = false; return; }
      const t = e.touches[0];
      const target = e.target;
      // never hijack gestures that start in form fields or on the audio button
      if (target.closest && target.closest("input,textarea,#audio-toggle")) {
        tracking = false; return;
      }
      startX = t.clientX; startY = t.clientY;
      startT = Date.now(); tracking = true;
    }, { passive: true });

    stage.addEventListener("touchend", e => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX, dy = t.clientY - startY;
      const dt = Date.now() - startT;
      // deliberate horizontal swipe right, not a scroll and not a tap
      if (dx > 70 && dx > Math.abs(dy) * 1.6 && dt < 700 &&
          Model.state.screen !== "home" && !this.transitioning) {
        this.goTo("home");
      }
    }, { passive: true });
  },

  bindKeyboard() {
    addEventListener("keydown", e => {
      // Don't hijack keys while the visitor types in the contact form
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (Model.state.screen === "home") {
        if (e.key === "ArrowDown") { this.select(Model.state.menuIndex + 1); e.preventDefault(); }
        else if (e.key === "ArrowUp") { this.select(Model.state.menuIndex - 1); e.preventDefault(); }
        else if (e.key === "Enter") {
          this.goTo(View.els.menuItems[Model.state.menuIndex].dataset.target);
        }
      } else if (e.key === "Escape") {
        this.goTo("home");
      }
    });
  },
};

Controller.init();
