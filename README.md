# KuroNeko (黒猫) — Anime & Manga Universe

A modern, classy anime and manga reading web application built using curated public community APIs from [public-apis/public-apis](https://github.com/public-apis/public-apis.git).

![Preview](https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Key Features

### 📖 Manga Hub & Reading Experience
- **Live Manga Catalog**: Powered directly by the **MangaDex REST API** (`api.mangadex.org`).
- **Read Up to Latest Chapters**: Browse, search, and read all published English chapters for any manga up to the latest releases.
- **World-Class Reader**:
  - **Webtoon Mode (Long Strip)**: Continuous vertical smooth scrolling with auto-scroll and page gap adjustment.
  - **Single Page Mode**: Flip through pages one-by-one with keyboard shortcuts (Left/Right arrows, Space, A/D) or on-screen tap controls.
  - **MangaDex@Home High-Res CDN**: Crisp HD pages with optional **Data-Saver** mode for fast loading on slower networks.
  - **Fullscreen Toggle**: Enter distraction-free reading (`F` key or icon).
  - **Instant Chapter Switcher**: Switch to any chapter on the fly without closing the reader.

### ⏱️ Reading Tracker & History
- **"Jump Back In" Last-Read Banner**: Prominently highlights the exact manga you read last, showing chapter number, page progress, and a one-click **Resume Reading** button.
- **Reading History Timeline**: Automatically tracks every manga and chapter you read with relative timestamps (e.g., *"10 minutes ago"*, *"Yesterday"*).
- **Chapter Checkmarks**: Automatically marks finished chapters with green checkmarks so you always know what you've read.

### 🔖 Bookmarks & Personal Library
- **Status Organization**: Categorize titles into:
  - 📖 **Reading**
  - 📋 **Plan to Read**
  - ✅ **Completed**
  - ⭐ **Favorites**
  - ⏸️ **On Hold**
- **Library Statistics**: Live overview of total books saved, currently reading, and chapters completed.
- **Backup & Sync**: Export your entire library and reading history to JSON, or restore from a backup file with one click.

### 🎬 Anime Hub & Video Trailers
- **Trending & Seasonal Anime**: Discover currently airing hits and top-rated masterworks via the **AniList GraphQL API**.
- **Interactive Trailer Player**: Watch official YouTube trailers directly in a cinematic modal without leaving the site.
- **Rich Metadata**: Airing schedules, episode counts, studio names, and genres.

### 🎨 Classy Hybrid UI Design
- A polished fusion of **MangaDex**, **AniList**, **Crunchyroll**, and **Netflix**:
  - Deep obsidian & slate dark mode (`#080a0f`, `#0c1017`).
  - Frosted glassmorphism navigation and floating toolbars.
  - Glowing rose-crimson and amber neon accents.
  - Responsive layouts optimized for desktop, tablets, and mobile devices.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Run
```bash
# Clone or navigate to the directory
cd Anime

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

Open your browser and navigate to:
```
http://127.0.0.1:5173/
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Public APIs Used
Sourced from [public-apis/public-apis](https://github.com/public-apis/public-apis.git):
1. **[MangaDex API](https://api.mangadex.org/docs/)**: Manga search, covers, chapter feeds, and MangaDex@Home reader image CDN.
2. **[AniList API](https://github.com/AniList/ApiV2-GraphQL-Docs)**: Anime discovery, popularity, studios, and official trailer embeds.
