# Web3 Social Networking Telegram Mini App

This is a Next.js (App Router) prototype built for scanning QR codes at offline Web3 events, capturing a photo together, selecting a greeting message, and sending this securely to both users via a Telegram bot.

## Features
- **Next.js 14 App Router** frontend and backend.
- **Tailwind CSS** mobile-first UI design.
- **Telegram Mini App API** (`@twa-dev/sdk`) to capture user TG IDs, provide the QR scanner UI, and native alerts.
- **Camera API** integration to capture photos.
- **Supabase** Storage and Database for saving the connections.
- **Telegraf** bot to automatically dispatch messages to users with their captured photo.

## Setup

1. Copy `.env.example` to `.env` and configure your keys.
    ```bash
    cp .env.example .env.local
    ```
2. Set up your **Supabase**:
   - Create a `connections` table:
     ```sql
     CREATE TABLE connections (
       id uuid default uuid_generate_v4() primary key,
       scanner_tg_id text,
       scanned_tg_id text,
       message text,
       image_url text,
       created_at timestamp with time zone default timezone('utc'::text, now())
     );
     ```
   - Make sure your table allows insertions or disable RLS for testing.
   - Create a Storage Bucket called `photos` with Public Access enabled.
3. Install dependencies:
    ```bash
    npm install
    ```
4. Run locally:
    ```bash
    npm run dev
    ```

> Note: To test the `@twa-dev/sdk` correctly, you must run this inside the Telegram App. You can either deploy your code to Vercel and set the TG bot Web App URL, or use ngrok to expose your `localhost:3000` to a secure `https://` endpoint.
