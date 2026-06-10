# Security Interview Prep Quiz

A static cybersecurity interview prep quiz built with Vite, React, and TypeScript. The app runs as a single-page UI and is ready to deploy to Cloudflare Pages with `dist` as the build output directory.

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

## Cloudflare Pages deployment

Use these Cloudflare Pages settings:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** repository root

Cloudflare Pages will install npm dependencies, run the build command, and publish the generated files from `dist`.

## Git learning notes

Useful git commands while working on this project:

```bash
git status --short
```

Shows which files are new, modified, deleted, or staged.

```bash
git diff
```

Shows unstaged line-by-line changes.

```bash
git add <file-or-directory>
```

Stages changes so they are included in the next commit.

```bash
git commit -m "Your commit message"
```

Creates a checkpoint in history with the currently staged changes.
