# QuickPoll

QuickPoll is a small web application where registered users can create multiple-choice polls, publish them, share public links, collect anonymous votes, and view owner-only results.

This project was built for Engineering Design 2 using AI-assisted development.

## Features

- User registration with Supabase Auth
- Login and logout
- Email verification through Supabase
- Persistent authenticated sessions
- Authenticated dashboard for poll owners
- Create, view, edit, and delete polls
- Polls with one question and 2-6 answer options
- Publish and unpublish polls
- Public share links for published polls
- Anonymous voting without an account
- Simple browser `localStorage` duplicate-vote convenience guard
- Owner-only results
- Total vote count, per-option vote counts, percentages, and simple result bars

Public poll pages do not show results. The duplicate-vote guard is not secure anti-cheat; it only reduces repeat votes from the same browser for this class project.

## Technologies Used

- React
- Vite
- JavaScript
- Supabase PostgreSQL
- Supabase Auth
- `@supabase/supabase-js`
- React Router
- Netlify

## Local Setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a local environment file from the example:

```bash
cp .env.example .env
```

4. Add your Supabase project values to `.env`:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

`VITE_SUPABASE_URL` is the public Supabase project URL. `VITE_SUPABASE_ANON_KEY` is the public anon/publishable client key.

Never use or expose the Supabase service-role key in the frontend.

5. Run the development server:

```bash
npm run dev
```

## Supabase Setup

Apply the migrations in this order using the Supabase SQL Editor:

1. `supabase/migrations/20260928000000_initial_schema.sql`
2. `supabase/migrations/20260928001000_create_profile_on_signup.sql`

The initial schema creates:

- `profiles`
- `polls`
- `poll_options`
- `votes`

Row Level Security is enabled. The policies allow owners to manage their own polls and options, allow public reads for published polls/options, allow anonymous vote inserts for published polls, and allow owners to read votes for their own polls.

The profile trigger migration automatically creates a `profiles` row when a new Supabase Auth user signs up.

## Production Build

```bash
npm run build
```

The production output is written to `dist`.

## Deployment

QuickPoll is prepared for Netlify deployment.

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Add those environment variables in the Netlify site settings. Do not commit real `.env` files or secret keys.

SPA routing support is included through `public/_redirects`, which Vite copies into `dist/_redirects`. This allows direct visits to routes such as `/poll/:pollId` after deployment.

## Project Status

Core functionality is complete for the class project:

- authentication
- poll CRUD
- publishing and public links
- anonymous voting
- owner-only results
- deployment-ready build configuration

## Demo

Deployed App:  
(https://quickpollv1.netlify.app)

Demo Video:  
[ADD YOUTUBE DEMO URL]

## Final Manual Test Checklist

Auth:

- Register a new account.
- Verify the account email.
- Log in.
- Refresh the page and confirm the session persists.
- Log out.

Poll CRUD:

- Create a poll with 2-6 answer options.
- View poll details.
- Edit poll title, description, question, and options before votes exist.
- Delete a poll.

Publishing:

- Publish a draft poll.
- Copy the public link.
- Open the public link while logged out.
- Unpublish the poll and confirm the public link becomes unavailable.

Voting:

- Vote anonymously on a published poll.
- Confirm a row appears in `public.votes`.
- Refresh the same browser and confirm the duplicate-vote guard appears.
- Confirm a different browser or incognito session can vote independently.

Results:

- Refresh owner results.
- Confirm total vote count is correct.
- Confirm per-option counts and percentages are correct.
- Confirm result bars match the percentages.
- Confirm public poll pages do not show results.

Deployment readiness:

- Run `npm run build`.
- Confirm `dist/_redirects` exists.
- Confirm Netlify environment variable names are documented.
