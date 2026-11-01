# KuroNeko (黒猫) — Manga & Anime Universe

A high-performance, dynamic anime discovery and manga reading application built with React 19, Vite, and Tailwind CSS. Featuring continuous chapter streams, high-definition AniList covers, instant client-side search, reader customisation, and offline local library tracking.

**Live Application (GitHub Pages):**  
👉 **[https://narendraborhade-creator.github.io/Manga.for-me/](https://narendraborhade-creator.github.io/Manga.for-me/)**

---

## Highlights

### 📖 Manga Experience
- **Complete Chapter Catalog:** Continuous chapter access across popular manhwa, webtoons, and manga series (from Chapter 1 up to latest).
- **Direct Web Reader Bridge:** Seamless one-click reading with instant verified online reader integration for every chapter.
- **Dynamic Reading Modes:** Seamless vertical Webtoon mode, Single Page, and Double Page spreads.
- **Reading Enhancements:** Auto-scroller with speed tuning, OLED pure black theme, eye-care sepia filter, fullscreen toggle, and keyboard shortcuts.
- **Fast Search:** Direct AniList GraphQL and catalog search running client-side with zero latency.
- **Reliable Media CDN:** Unblocked AniList and official CDN cover art worldwide.

### 🎬 Anime Discovery
- **Trending & Airing Hub:** Real-time trending, all-time popular, and seasonal anime directly from the AniList API.
- **Deep Metadata:** Studio information, air dates, episode counts, genres, descriptions, and playable YouTube trailers.

### 📚 Mission Control & Library
- **Continue Reading Shelf:** Mission-control carousel resuming your exact manga, chapter, and page position.
- **Reading History & Tracker:** Chapter-by-chapter completed tracking with visual checkmarks and time elapsed.
- **Universal Backup & Restore:** One-click JSON backup export and import to migrate your library across devices (phones, tablets, and desktop).

---

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, Lucide React
- **Static Hosting:** GitHub Pages with GitHub Actions CI/CD (`.github/workflows/deploy.yml`)
- **APIs & Data:** AniList GraphQL API, MangaDex API
- **Persistence:** Browser `localStorage` for library bookmarks, reading history, and custom reader preferences

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/narendraborhade-creator/Manga.for-me.git
cd Manga.for-me

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173/Manga.for-me/](http://localhost:5173/Manga.for-me/) in your browser.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Launch the local Vite development server |
| `npm run build` | Compile and bundle production assets to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run code quality checks with Oxlint |

---

## Deployment to GitHub Pages

This repository is configured for automated deployment to GitHub Pages via `.github/workflows/deploy.yml`.

1. Any push to `main` triggers the automated Vite build and deploys to GitHub Pages.
2. The bundled static assets are also committed to `docs/` and synced with the `gh-pages` branch for instant static serving.

---

## License

This project is licensed under the [MIT License](./LICENSE).
