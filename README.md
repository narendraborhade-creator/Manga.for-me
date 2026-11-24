# KuroNeko (黒猫)

KuroNeko is a manga and manhwa discovery and reading application built with React and Vite. It combines multiple community sources with MangaDex and AniList metadata, while keeping bookmarks, reading progress, history, reader preferences, and update settings in the browser.

**Live application:** [narendraborhade-creator.github.io/Manga.for-me](https://narendraborhade-creator.github.io/Manga.for-me/)

## Features

- Browse popular, latest, and recommended manga.
- Search across supported providers and filter by genre or source.
- View manga details, chapters, covers, ratings, news, and related titles.
- Read in Webtoon, single-page, or double-page mode.
- Use reading direction, fit, page-gap, auto-scroll, fullscreen, and keyboard controls.
- Resume the last chapter and page from the **Continue Reading** shelf.
- Manage bookmarks, statuses, categories, reading history, and chapter updates.
- Export and import library data as JSON for backups or device migration.
- Install and browse Mihon-compatible source repositories from the Extensions view.
- Use the included Android application under [`KuroNekoAndroid/`](./KuroNekoAndroid/).

## Tech stack

- **Web:** React 19, Vite, Tailwind CSS 4, Lucide React
- **API layer:** Node.js providers for MangaDex and community manga sources
- **Metadata:** AniList and MangaDex
- **Storage:** Browser `localStorage`
- **Android:** Kotlin, Jetpack Compose, Android SDK 36
- **Deployment:** GitHub Pages through [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

## Run locally

### Web application

```bash
git clone https://github.com/narendraborhade-creator/Manga.for-me.git
cd Manga.for-me
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite development server also exposes the application's `/api/*` routes.

To run the production server locally:

```bash
npm run build
npm start
```

The production server listens on `http://localhost:3000` by default. Set `PORT` to use a different port:

```bash
PORT=8080 npm start
```

### Android application

The Android project requires Java 17 and an Android SDK compatible with compile SDK 36.

```bash
cd KuroNekoAndroid
./gradlew assembleDebug
```

The debug APK is written to `app/build/outputs/apk/debug/app-debug.apk`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production bundle in `dist/` |
| `npm start` | Serve the built bundle and API routes with Node.js |
| `npm run preview` | Preview the production bundle with Vite |
| `npm run lint` | Run Oxlint |

## API routes

The local Node/Vite API layer provides:

- `/api/manga/popular`
- `/api/manga/search`
- `/api/manga/details`
- `/api/manga/read`
- `/api/manga/news`
- `/api/manga/recommendations`
- `/api/extensions/repo`
- `/api/extensions/source`
- `/api/image-proxy`

Provider availability and chapter coverage can change because the application relies on third-party services. KuroNeko does not host manga content.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow. It installs dependencies, runs `npm run build`, prepares the SPA fallback, and deploys the resulting `dist/` directory to GitHub Pages. The workflow can also be started manually with **workflow_dispatch**.

## License

This project is licensed under the [MIT License](./LICENSE).
