# QuickPoll

QuickPoll is a simple web application where registered users will be able to create multiple-choice polls, share them with others, and view the results.

This project is being built for Engineering Design 2 using AI-assisted development. It is currently in early development, with a React/Vite frontend, Supabase authentication, and authenticated poll management.

## Technology Stack

- React
- Vite
- JavaScript
- `@supabase/supabase-js`
- `react-router-dom`
- Supabase PostgreSQL
- Supabase Auth
- Netlify (planned deployment)

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Then fill in the local `.env` file:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

`VITE_SUPABASE_URL` should use the public Supabase project URL. `VITE_SUPABASE_ANON_KEY` should use the public anon/publishable client key.

Never use or expose the Supabase service-role key in the frontend.

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

## Supabase

Supabase provides the PostgreSQL database and authentication for QuickPoll. The React app uses Supabase Auth for registration, login, logout, persistent sessions, and authenticated poll management.

The migrations are located at:

```text
supabase/migrations/20260928000000_initial_schema.sql
supabase/migrations/20260928001000_create_profile_on_signup.sql
```

To apply the migrations manually:

1. Create or open a Supabase project.
2. Open the Supabase SQL Editor.
3. If the initial schema has not already been applied, copy and run the SQL from `supabase/migrations/20260928000000_initial_schema.sql`.
4. Copy and run the SQL from `supabase/migrations/20260928001000_create_profile_on_signup.sql`.

The second migration creates a trigger that automatically adds a `profiles` row whenever a new Supabase Auth user signs up.

Do not commit real Supabase credentials or local `.env` files to the repository. `.env.example` should contain placeholders only.

## Current Features

- Register, log in, and log out with Supabase Auth
- Restore an existing authenticated session on page load
- Automatically create a profile row when a user signs up
- Show a dashboard listing polls owned by the current user
- Create draft polls with one question and 2-6 answer options
- View poll details and ordered answer options
- Edit draft poll text and answer options
- Delete polls after confirmation
- Publish and unpublish polls
- Generate shareable public links for published polls
- Open published polls without an account at `/poll/:pollId`
- Vote on published polls without an account
- Store submitted votes in Supabase

Public poll pages allow anonymous voting. Results, charts, percentages, and owner result views are planned for later phases.

Anonymous voting currently uses a simple `localStorage` key per poll to reduce repeat votes from the same browser. This is a convenience guard for the class project, not secure anti-cheat. It does not use IP tracking, fingerprinting, CAPTCHA, or voter accounts.

Note: QuickPoll currently allows editing published polls. Phase 4 edits poll options by deleting and recreating option rows. Future phases may need to restrict option editing for published polls or polls that already have responses.

## Development Status

QuickPoll currently supports registration, login, logout, persistent Supabase Auth sessions, automatic profile creation, authenticated poll CRUD, publishing, public poll links, and anonymous vote submission. Results and deployment will be added in later phases.
