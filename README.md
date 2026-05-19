# Deschamps News

A searchable, AI-enriched archive for Filipe Deschamps' newsletter.

Deschamps News imports newsletter emails, splits each edition into individual posts, classifies the content with Groq, and exposes a clean interface for browsing by date, category, entity, or search term.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [API Endpoints](#api-endpoints)
- [Sync Pipeline](#sync-pipeline)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

## Overview

The project is a Next.js application designed to make newsletter content easier to discover after publication. Instead of treating each email as a single document, the sync pipeline extracts every story as a separate post and stores it in MongoDB with metadata such as date, order number, categories, entities, sponsored status, and like count.

The public interface is optimized for archive browsing: users can open the current edition, jump to past weekdays with a calendar, search by text, filter by category, and share direct links to individual posts.

## Features

- Daily newsletter archive with date-based pages.
- Permanent links for individual posts.
- Calendar navigation with weekday-only selection.
- Text search across imported posts.
- Category and entity tags for content discovery.
- Share links copied directly to the clipboard.
- IMAP-based ingestion for unread newsletter emails.
- AI classification for categories, entities, and sponsored content.
- Operational reports for missing newsletter days and incomplete posts.
- Vercel cron configuration for automated weekday syncs.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | MongoDB |
| Email ingestion | ImapFlow, Mailparser, Cheerio |
| AI enrichment | Groq SDK |
| UI helpers | React Calendar, React Icons, React Toastify |
| Deployment | Vercel |

## Prerequisites

- Node.js 20 or later.
- Yarn.
- MongoDB database.
- Groq API key.
- IMAP email account with access to the newsletter mailbox.
- Vercel account, if deploying with the included cron configuration.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/<your-username>/deschampsnews.git
cd deschampsnews
```

Install dependencies:

```bash
yarn install
```

Create `.env.local`:

```bash
MONGODB_URI=
GROQ_API_KEY=
IMAP_USER=
IMAP_PASS=
CRON_SECRET=
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

Start the development server:

```bash
yarn dev
```

Open `http://localhost:3000` in your browser.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. The app uses the `deschamps-news` database. |
| `GROQ_API_KEY` | Required for sync | API key used by `groq-sdk` to classify imported posts. |
| `IMAP_USER` | Required for sync | Email account used to read newsletter messages from Zoho IMAP. |
| `IMAP_PASS` | Required for sync | Password or app password for the IMAP account. |
| `CRON_SECRET` | Recommended | Bearer token used to protect sync and report endpoints. |
| `NEXT_PUBLIC_APP_BASE_URL` | Yes | Public base URL used when generating share links. |

## Available Scripts

```bash
yarn dev
```

Starts the local development server with Turbopack.

```bash
yarn build
```

Builds the production application.

```bash
yarn start
```

Starts the production server after a successful build.

```bash
yarn lint
```

Runs the configured lint command.

## Application Routes

| Route | Description |
| --- | --- |
| `/` | Displays today's imported newsletter posts. |
| `/:date` | Displays all posts for a date in `YYYY-MM-DD` format. |
| `/:date/:number` | Displays a single post by date and newsletter order number. |
| `/search?query=<term>` | Searches posts by text. |
| `/search?category=<category>` | Filters posts by category. |

## API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/sync` | `GET` | Imports unread newsletter emails and stores parsed posts. |
| `/api/report/missing-posts` | `GET` | Lists weekdays with no imported posts for a period. |
| `/api/report/incomplete-posts` | `GET` | Lists posts missing expected fields. |

When `CRON_SECRET` is configured, protected endpoints require:

```http
Authorization: Bearer <CRON_SECRET>
```

Example:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/report/incomplete-posts
```

## Sync Pipeline

1. Connects to Zoho IMAP.
2. Opens the `NewsLetter` mailbox.
3. Fetches unread messages from `newsletter@filipedeschamps.com.br`.
4. Parses the email HTML with Mailparser and Cheerio.
5. Converts newsletter paragraphs into individual posts.
6. Sends each post to Groq for classification.
7. Upserts posts into MongoDB using `date` and `number`.
8. Marks processed messages as read.

## Project Structure

```text
src/
  app/                  Next.js app routes and API endpoints
  components/           Sidebar, post, like, and share components
  services/             Data access functions
  types/                Shared TypeScript interfaces
  utils/                MongoDB, Groq, and Day.js helpers
```

## Deployment

The project is configured for Vercel. The included `vercel.json` defines a weekday cron job:

```json
{
  "crons": [
    {
      "path": "/api/sync",
      "schedule": "30 14 * * 1-5"
    }
  ]
}
```

This runs `/api/sync` at `14:30 UTC`, Monday through Friday. Configure all required environment variables in the Vercel project settings before enabling the deployment.

## Contributing

Contributions are welcome. For meaningful changes, open an issue first to discuss the proposal and expected behavior.

Recommended workflow:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes with focused commits.
4. Run the relevant checks.
5. Open a pull request with a clear description.

## License

No license file is currently included. Until a license is added, all rights are reserved by the repository owner.

## Disclaimer

This is an independent archive and discovery interface for newsletter content. It is not an official Filipe Deschamps product and is not affiliated with Filipe Deschamps.
