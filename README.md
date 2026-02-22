# Cognify

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
[![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/)
[![Documentation Status](https://readthedocs.org/projects/ansicolortags/badge/?version=latest)](http://ansicolortags.readthedocs.io/?badge=latest)
[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com)
[![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://typescriptlang.org)
[![Npm](https://badgen.net/badge/icon/npm?icon=npm&label)](https://https://npmjs.com/)
[![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?logo=drizzle&logoColor=000)](#)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff)](#)
[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](#)
[![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white)](#)
[![GitHub branches](https://badgen.net/github/branches/XDTerminated/hack-slu-2026)](https://github.com/XDTerminated/hack-slu-2026/branches/)
[![GitHub commits](https://badgen.net/github/commits/XDTerminated/hack-slu-2026)](https://github.com/XDTerminated/hack-slu-2026/commit/)


> AI-powered study assistant for Canvas LMS that generates custom Q&A from course content.

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Roboto&weight=900&size=40&duration=3000&pause=1000&color=0981F7&background=FFFFFF00&center=true&vCenter=true&width=1245&lines=Dynamically+Generated+Quizzes;Instantaneous+Feedback;Live+Performance+Metrics)](https://git.io/typing-svg)

---

## Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Production](#production)
- [Troubleshooting](#troubleshooting)
- [Core Team](#core-team)

---

## About

Cognify connects to your Canvas account, pulls course files (PDFs and other supported files) and pages, and uses AI to generate tailored study questions and answers.

## Features

- Connect to Canvas via a personal access token.
- List courses, course pages, and downloadable course files.
- Download and parse PDFs to extract text for AI-driven question generation.
- Session-based storage of Canvas tokens for user sessions.

## Tech Stack

- Frontend: Next.js (app router) + React — located under [src/app](src/app#L1)
- Server / API: Node + TypeScript helpers in [src/server](src/server#L1)
- Database: Postgres with Drizzle ORM
- PDF parsing: `pdf-parse`

## Quick Start

Prerequisites:

- Node.js 18+ and `pnpm` (the project uses `pnpm`)
- A running Postgres instance (the repo includes `start-database.sh` for local development)
- A Canvas personal access token

Install dependencies:

```bash
pnpm install
```

Start local DB (optional):

```bash
./start-database.sh
```

Create a `.env` or export environment variables (see below). Then run the dev server:

```bash
pnpm dev
```

Open http://localhost:3000

## Environment Variables

Minimal required server-side variables:

- `DATABASE_URL` — Postgres connection string
- `GROQ_API_KEY` — required by the app (see [src/env.js](src/env.js#L1-L40))
- `SESSION_SECRET` — 32+ character secret for session encryption
- `NODE_ENV` — `development` or `production`

Note: The environment schema and runtime mapping are defined in [src/env.js](src/env.js#L1-L40).

## Production / Build

Build and start:

```bash
pnpm build
pnpm start
```

Ensure the environment variables above are set in your production environment.

## Troubleshooting

- "No active courses found" — verify your Canvas token and scopes.
- File download failures — check that the token used can access course files and that `DATABASE_URL` is correct.
- Env validation errors — set `SKIP_ENV_VALIDATION=1` if you must skip validation (useful for some container builds).

## Core Team

<table>
  <tr>
    <td>
      <img src="https://github.com/xDTerminated.png" width="100px" alt=""/><br />
      <b>Sayam Gupta</b><br />
      <i>Lead Developer</i><br />
      <a href="https://github.com/xDTerminated">GitHub</a>
    </td>
    <td>
      <img src="https://github.com/2406mmartin.png" width="100px" alt=""/><br />
      <b>Matthew Martin</b><br />
      <i>Frontend Developer</i><br />
      <a href="https://github.com/2406mmartin">GitHub</a>
    </td>
    <td>
      <img src="https://github.com/malizma333.png" width="100px" alt=""/><br />
      <b>Tobias Bessler</b><br />
      <i>Backend Developer</i><br />
      <a href="https://github.com/malizma333">GitHub</a>
    </td>
    <td>
      <img src="https://github.com/alvinmoy.png" width="100px" alt=""/><br />
      <b>Alvin Moy</b><br />
      <i>UI/UX Designer</i><br />
      <a href="https://github.com/alvinmoy">GitHub</a>
    </td>
  </tr>
</table>
