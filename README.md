# Security Interview Prep Quiz

A static cybersecurity interview prep quiz built with Vite, React, and TypeScript. The app runs as a single-page UI and is ready to deploy to Cloudflare Workers static assets with `dist` as the build output directory.

## Features

- 30-question quiz sessions, randomized from the local question bank.
- Multiple-choice and free-text question support.
- Multiple-choice scoring with a final results screen.
- Free-text self-review with model answers and explanations.
- Questions stored in `src/data/questions.json` for easy editing.
- Simple responsive CSS with no external UI framework.

## Question format

Questions currently live in `src/data/questions.json`. Each object should use one of these shapes:

```json
{
  "id": "sec-001",
  "type": "multiple-choice",
  "category": "Web security",
  "prompt": "Question text goes here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Explain why the answer is correct."
}
```

```json
{
  "id": "sec-002",
  "type": "free-text",
  "category": "Security design",
  "prompt": "Question text goes here?",
  "correctAnswer": "A concise model answer.",
  "explanation": "Additional context for self-review."
}
```

The app supports 30-question sessions. If the question bank has fewer than 30 questions, it will use every available question in the session.

## Local development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Cloudflare Workers deployment

This project uses `wrangler.jsonc` to deploy the Vite build output as Cloudflare Workers static assets.

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Wrangler config:** `wrangler.jsonc`

Deploy from the repository root with:

```bash
npm run deploy
```

Wrangler reads `wrangler.jsonc`, serves files from `dist`, and uses SPA fallback handling so quiz routes return `index.html`.



