# 🎮 Raihan — Persona-Style Portfolio

A bold, **Persona 5-inspired interactive portfolio** built with vanilla HTML, CSS and JavaScript — no frameworks, no build step, no dependencies. Navigate it like a game menu: keyboard, mouse or touch.

**Live sections:** Home · Projects · Skills · About · Contact

---

## ✨ Features

- 🕹️ **Game-menu navigation** — ↑/↓ to select, Enter to confirm, Esc to go back, with diagonal screen-wipe transitions
- ↩️ **Browser history integration** — opening a section pushes a History state (`#projects`, `#skills`, …) and the back button or gesture closes it back to the menu instead of leaving the site
- ✂️ **"Ransom-note" lettering** — every heading is assembled from pseudo-randomly rotated, boxed and tinted letters (deterministic per visit — same look every time)
- 🖱️ **Custom animated cursor** — 30-frame sprite-strip cursor with a distinct link state, auto-disabled on touch devices
- 🎵 **Background music + SFX** — menu sounds on every selection, looping site music, and a global mute toggle
- 📄 **CV download** — one-click PDF download from both the About and Contact screens
- 📬 **Working contact form** — delivered to email via the FormSubmit relay, with a honeypot spam trap, timeout handling and a mailto fallback
- 📋 **Copy-email chip** — copies the address to the clipboard and opens Gmail, with on-screen toast feedback
- 🧠 **Respects users** — honours `prefers-reduced-motion`, visible focus outlines, semantic HTML and ARIA labels
- 🪶 **Zero dependencies** — plain HTML/CSS/JS, deployable on any static host

---

## 🛠️ Technologies Used

| Layer | Tech |
|---|---|
| Markup | HTML5, semantic sections, ARIA labels |
| Styling | CSS3 — custom properties, `clip-path`, keyframe animations, grid/flexbox, media queries, `prefers-reduced-motion` |
| Fonts | [Archivo Black](https://fonts.google.com/specimen/Archivo+Black) & [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed) via Google Fonts |
| Logic | Vanilla JavaScript (ES2020) — **MVC pattern**: `model.js` (data) · `view.js` (rendering) · `controller.js` (events) |
| APIs | History API (back-button navigation) · GitHub REST API (repo feed, optional) · FormSubmit AJAX (contact form) · Clipboard API |
| Media | MP4 background video (home/skills), MP3 audio, PNG sprite cursors |

---

## 📁 Project Structure

```
├── index.html            View skeleton — markup only, no logic or styles
├── css/
│   └── style.css         All styling (theme colors in :root at the top)
├── js/
│   ├── model.js          DATA — featured projects, skills, GitHub fetch, app state
│   ├── view.js           VIEW — rendering, ransom lettering, wipe, cursor, clock
│   └── controller.js     CONTROLLER — keyboard/mouse input, navigation, audio, forms
├── assets/
│   ├── cursors/          Animated cursor sprite strips (30 frames each)
│   ├── menus/            Per-screen background art: home.jpg, skills.jpg, about.jpg, contact.jpg
│   ├── sfx/
│   │   ├── select.mp3            Menu select sound
│   │   └── background-music.mp3  Site music (starts on first interaction)
│   ├── cv/
│   │   └── Raihan_CV.pdf Downloadable CV (linked from About + Contact)
│   ├── me.jpg            About-page photo
│   ├── video/            Optional: home-background.mp4, skills.mp4
│   └── projects/         Optional: card thumbnails (oscilloscope.png, cmos.png, …)
├── LICENSE               MIT license
└── .gitignore
```

> **Missing images/videos hide themselves** — no broken icons, ever. The CSS striped background shows through wherever media is absent.

---

## 🚀 Setup Instructions

### Prerequisites
Any modern browser. A local server is required for full functionality (audio + external requests are blocked on `file://` pages).

### Run locally

**Option 1 — Python (preinstalled on most systems):**
```bash
python -m http.server 8000
```

**Option 2 — Node.js:**
```bash
npx serve .
```

Then open **http://localhost:8000**.

### Deploy to GitHub Pages

1. Push this repository to GitHub
2. **Settings → Pages → Deploy from a branch → main → / (root)**
3. Your site is live at `https://<username>.github.io/<repo>/`

---

## ✏️ Customizing Content

Everything you'd normally edit lives in three places:

| File | What's inside |
|---|---|
| `js/model.js` | Featured projects, skill bars, contact email, GitHub username |
| `index.html` | Home tagline, About text, contact links |
| `css/style.css` | Theme colors (`:root` variables at the top) |

### Enable the GitHub repo feed
The Projects screen can list your public repositories automatically. In `js/model.js`:
```js
githubUser: "your-username",
```
Leave it as `""` to keep the feed hidden. Repository names shown in `featured` are excluded from the feed via `featuredRepoNames`.

Every feed card shows a description: the repo's GitHub description first, otherwise a one-liner from `repoDescriptions` in `js/model.js` — so a repo missing a description still never renders blank.

### Add project thumbnails
Drop PNGs into `assets/projects/` — featured cards use the `img` path set in `model.js`; auto-fetched repos match by exact repo name (e.g. `my-app.png` for a repo named `my-app`).

### Activate the contact form
The form is relayed by [FormSubmit](https://formsubmit.co) using the `contactEmail` in `model.js`:
1. Deploy the site over HTTPS
2. Submit the form **once** — FormSubmit emails a one-time activation link to your inbox
3. Click the link — the form is live permanently (pre-activation submissions are queued, not lost)

### Audio behavior
Browsers block autoplay, so playback capability is unlocked on the visitor's first click or keypress — but the site music stays **muted by default**. The 🔊 button (bottom-right) turns the music on, and then mutes/unmutes music and video sound together.

---

## 🎮 Controls

| Key | Action |
|---|---|
| ↑ / ↓ | Select menu item |
| Enter | Confirm |
| Esc | Back to home |
| Browser back / back gesture | Close the open section (returns to home) |
| Click name | Return home |
| 🔊 button | Mute / unmute audio |
| **Touch:** tap menu item | Select + open section |
| **Touch:** swipe right | Back to home |

> 📱 The site is fully responsive on phones and tablets — single-column card
> grids, touch scrolling with momentum, tap feedback instead of hover, and
> safe-area support for notched devices. Landscape phones get a compact HUD
> and menu layout.
>
> 🔙 On phones, the system back gesture/button closes the open section and
> returns to the menu (via the History API) instead of leaving the site.

---

## ⚡ Performance Notes

- No frameworks, no build step — the entire site is static
- All card thumbnails use `loading="lazy"`
- Parallax and cursor loops run on `requestAnimationFrame` with smoothed (lerped) values
- Fonts load with `display=swap`; a system-font fallback stack keeps text visible during load
- Contact-form requests abort after 12 s and fall back to `mailto:`

---

## 🌐 Browser Support

Latest Chrome, Edge, Firefox and Safari. The custom cursor activates on fine-pointer devices only; touch users get native behavior.

---

## 📄 License

Released under the **MIT License** — see [LICENSE](LICENSE).

You are free to use, copy, modify and distribute this portfolio, including for your own personal portfolio site — attribution is appreciated but not required. The "Persona-style" design is an original homage and is not affiliated with or endorsed by ATLUS/SEGA.
