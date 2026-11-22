# Srihari's Interactive Portfolio

A production-ready, responsive personal portfolio for **Srihari**, an Electronics & Computer Science engineer combining development, product thinking, analytics, design, marketing, music, writing, cricket and cinema.

Built with **Next.js 14, TypeScript, Tailwind CSS, Motion, and Lucide icons**.

---

## 🌟 Key Features

### 1. Dual Portfolio Modes (Persistent Toggle)
* **Normal Mode (Default):**
  * Warm ivory background (`#FAF8F5`), elegant typography, lime/chartreuse accents.
  * Hero: *"Somewhere between logic & imagination."*
  * Structured specifically for technical and product recruiters.
* **TFI Mode (Toggle):**
  * Dark Telugu cinema-inspired desk aesthetic (`#0B0D12`, warm projector amber & film reel borders).
  * Hero: *"I build. I write. I watch."*
  * **Sleeping cricket-ball mascot** wearing headphones with laptop & popcorn.
  * **Five interactive physical drawers**: Work, Writing, Cinema, Music, Playground.
  * **Interactive Spiral Movie Calendar**: tracks marquee South Indian releases (Devara, Pushpa 2, Game Changer, OG, SSMB 29, Kalki 2).
  * Context-aware Telugu meme reactions & witty Telugu-English microcopy.

### 2. Role-Based Portfolio: "Same builder. Different departments."
Visitors and recruiters can dynamically select their perspective:
* **Product Management**: PRD, user discovery interviews, RICE feature prioritization, roadmaps, trade-offs.
* **Software Development**: Sub-70ms WebSockets, Next.js App Router, FastAPI, PostgreSQL, architecture & systems.
* **Data Analytics**: 250,000+ ball-by-ball deliveries, Win Probability Added (WPA) models, spatial pitch coordinate heatmaps, BERT sentiment analysis.
* **UI/UX Design**: Spatial cricket radar, high-contrast dark telemetry, radial thumb dials, accessibility (WCAG AA).
* **Marketing & Growth**: Grassroots sports distribution, dynamic OG cards, viral Substack articles, zero-spend CAC.
* **Creative Strategy**: Poetic Telugu Chandassu prosody, cultural Telugu cinema lore, brand storytelling.

### 3. Writing Hub — External Publications
Editable content collection featuring preview cards linking out to original publications (**target="_blank"**):
* **Substack**: Product essays & newsletters
* **Medium**: Tech & analytics architectures
* **Notion**: PRDs, specs & user research
* **X Articles**: Industry opinions & analysis
* Filter by category, platform, and live search.

### 4. Interactive Pages
* **Home (`/`)**: Identity, highlights, role lens, drawers & featured work.
* **Work (`/work`)**: Comprehensive case-study directory and internal deep dives (`/work/cricfield`, `/work/hiremap`, `/work/cinevault`, `/work/iot-pulse`, `/work/lyriclab`).
* **Writing (`/writing`)**: Unified external publication magazine.
* **Creative (`/creative`)**: Vintage cassette tape deck, original Telugu lyrics notebook, 70mm film-strip gallery.
* **Playground (`/playground`)**: Live Cricket Chase Win Predictor, ESP32 DSP waveform oscilloscope, Telugu meme engine.
* **About (`/about`)**: Personal journey, Electronics & CS credentials, verified skills matrix, career timeline.

---

## 🚀 Running the Project

### One-Click Auto Start
Double-click `autostart.bat` in the root folder:
* Verifies Node.js & dependencies (`node_modules`)
* Starts the local server
* Automatically opens `http://localhost:3000` in your default browser

### Windows Auto-Start on System Boot
* **Enable auto-start on Windows startup**: Double-click `enable-windows-autostart.bat`.
* **Disable auto-start on Windows startup**: Double-click `disable-windows-autostart.bat`.
* **Stop running server**: Double-click `stop.bat` to terminate any process listening on port 3000.

### Manual Terminal Commands
```bash
# Start the server
node server.js
# Or standard Next.js dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
