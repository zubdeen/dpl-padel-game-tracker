# DPL Padel Game Tracker

Next.js version of the DPL Padel Game Tracker, preserving the original Supabase-backed app behavior.

## Local Development

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in:

   ```sh
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

3. Start the app:

   ```sh
   npm run dev
   ```

## Deploying to Vercel

1. Import the repository into Vercel.
2. Add the same two environment variables from `.env.example`.
3. Deploy with the default Next.js settings.

The Supabase schema and seed data are kept in `supabase/migrations`.
