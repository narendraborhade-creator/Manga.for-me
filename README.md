# KuroNeko (黒猫)

KuroNeko is a responsive anime discovery and manga reading application. It combines a multi-provider manga catalog with AniList anime data, a configurable reader, and a local library for tracking reading progress.

## Features

### Manga

- Search and browse popular, latest, recommended, and source-filtered manga.
- Aggregate catalog data from MangaDex, WeebCentral, Flame Comics, Thunder Scans, Asura Scans, Vortex Scans, MangaKakalot, Webtoon, and MangaPill.
- View manga details, chapter lists, metadata, covers, and related news.
- Read chapters in webtoon, single-page, or spread modes.
- Use continuous chapter loading, auto-scroll, fullscreen, data-saver mode, page-fit controls, reading direction, and keyboard navigation.

### Anime

- Explore trending, top-rated, and currently airing anime from AniList.
- Search by title or genre.
- View descriptions, scores, studios, schedules, episode information, and available YouTube trailers.

### Library and progress

- Save titles as Reading, Plan to Read, Completed, Favorites, or On Hold.
- Resume from the last manga, chapter, and page you opened.
- Track reading history and completed chapters.
- Check for new chapters in saved titles.
- Export and import library data and reading history as JSON.
- Move local data to another deployment using the built-in sync link.

## Tech stack

- React 19
- Vite
- Tailwind CSS 4
- Lucide React
- Vercel serverless API routes
- Browser `localStorage` for library, history, and reader settings

## Requirements

- Node.js 18 or newer
- npm

## Local development

```bash
git clone https://github.com/narendraborhade-creator/Manga.for-me.git
cd Manga.for-me
npm install
npm run dev
```

Open the local URL printed by Vite, usually [http://localhost:5173](http://localhost:5173).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Project structure

```text
api/                 Vercel API routes and image proxy
server/              Manga and news provider integrations
src/components/      Application, library, modal, and reader UI
src/services/        API clients, storage, and update services
public/              Static assets
```

The browser calls the `/api` routes for manga catalog, details, chapters, pages, recommendations, news, and image proxying. Provider-specific scraping and normalization stay in `server/`, while `src/services/` exposes the frontend-facing clients.

## Deployment

The project is configured for Vercel. Import the repository into Vercel and use the default settings:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

`vercel.json` configures the API function limits and routes all client-side paths to `index.html` so the Vite application can handle navigation.

## Data and provider notes

- Library data and reader preferences are stored locally in the browser; the application does not provide a hosted account or server-side sync database.
- Manga availability depends on the upstream providers. Provider layouts, chapter availability, rate limits, or outages can affect results.
- Manga and anime metadata, covers, images, and trailers are supplied by their respective upstream services. KuroNeko does not claim ownership of that third-party content.
- Use the application only where the upstream content and applicable local laws permit it.

## License

This project is released under the [MIT License](./LICENSE).
