# QuickPoll

QuickPoll is a simple web application where registered users will be able to create multiple-choice polls, share them with others, and view the results.

This project is being built for Engineering Design 2 using AI-assisted development. It is currently in early development, with a minimal React/Vite frontend and an initial Supabase database schema.

## Technology Stack

- React
- Vite
- JavaScript
- Supabase PostgreSQL
- Supabase Auth
- Netlify (planned deployment)

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

## Supabase

Supabase will provide the PostgreSQL database and authentication for QuickPoll. Phase 2 introduces the database schema only; the React frontend is not connected to Supabase yet.

The initial schema is located at:

```text
supabase/migrations/20260928000000_initial_schema.sql
```

To apply the schema manually:

1. Create or open a Supabase project.
2. Open the Supabase SQL Editor.
3. Copy the SQL from `supabase/migrations/20260928000000_initial_schema.sql`.
4. Run the SQL in the editor.

Future frontend setup will require environment variables similar to these:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not commit real Supabase credentials or local `.env` files to the repository.

## Development Status

QuickPoll currently contains a basic placeholder homepage and the initial Supabase database schema. Frontend Supabase integration, authentication screens, poll creation, voting, results, and deployment will be added in later phases.
