# Gun Exam Preparation App (Ieroču Eksamens 2026)

A web application designed to help users prepare for the official **Latvian State Police Qualification Exam for Firearms and Ammunition Handling (Ieroču un munīcijas aprites kvalifikācijas pārbaudījums)**.

Based on the official 2026 examination questions and correct answers parsed from `@docs/Ierocu_eksamena_jautajumi_un_atbildes_2026.pdf`.

## Features

- **Study Mode**: Browse all 515 official questions by section or all together. Receive instant feedback with correct answers highlighted in green.
- **Exam Simulation**: Timed 40-minute test consisting of 40 random questions (matching official exam conditions). Requires at least 36 correct answers (90%) to pass.
- **Bookmarks**: Flag difficult or important questions for quick review.
- **Statistics**: Track your total answered questions, overall accuracy, and exam history.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Deployment**: Docker & Docker Compose (Nginx serving static production build)

---

## Quick Start (Docker Compose)

The easiest way to run the application is using Docker Compose:

```bash
docker compose up -d --build
```

Open your browser at **`http://localhost:8080`**.

## License

MIT © [Reinholds Zviedris](https://estivador.io)

> Disclaimer: provided as-is for informational/educational use, with no warranty.
> Exam outputs are estimates — always confirm against official sources.

Source: https://github.com/zxpower/gun-exam

## Local Development

If you prefer running it locally for development:

```bash
cd web
npm install
npm run dev
```
