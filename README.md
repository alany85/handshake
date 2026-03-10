# Handshake 🤝

A next-generation Web3 Social Networking Telegram Mini App designed. Built to transform the cumbersome process of networking at crypto events into a delightful, mass-market consumer experience.

Instead of scanning generic QR codes or typing usernames manually, Handshake allows users to capture a visual "Digital Polaroid" memory of the person they met. Both individuals map their dynamic on-chain context and seamlessly transition into a 1-on-1 Telegram DM natively via the bot.

---

## 🏗️ Technical Architecture & Stack

### **Frontend layer**
- **Framework:** **Next.js 14 (App Router)** leveraging React Server Components.
- **Styling:** **Tailwind CSS** focusing entirely on a mass-market, "Apple iOS Clean" aesthetic (utilizing flat soft borders, extreme border-radii, and precise white/off-white `.bg-gray-50` isolation backgrounds).
- **Icons & Visuals:** `lucide-react` for beautiful, clean SVG symbology natively inside the DOM.
- **Integration:** Telegram Mini App SDK (`@twa-dev/sdk`) to securely grab the `initDataUnsafe` profile natively, bypassing traditional Web3 wallet connect flows.

### **Backend Integration**
- **Database / Backend-as-a-Service:** **Supabase** handles mapping our real-time relational tables structure capturing the `scanner`, `scanned`, generated `message`, and the uploaded `image_url`.
- **Storage:** Secure public Supabase image bucket storing the uncompressed physical `.jpeg` snapshots in real-time. 
- **Message Dispatch Protocol:** **Telegraf (Telegram Bot API)** runs securely inside serverless Next.js API Routes (`/api/connect`), blasting dual-sided inline-keyboard notifications back to the users directly on-chain/in-app.
- **Reverse Profile Lookups:** Implemented a secure Next.js Backend Proxy hitting the Bot API `getChat` and `getUserProfilePhotos` to map string-based User IDs securely into authentic Usernames, First Names, and Avatars (`/api/profile` & `/api/avatar`) without exposing the `BOT_TOKEN` to the browser.
- **Security:** Standard `.env.local` encryption shielding the Bot Token, Next Base URL, and Database keys from client-side vulnerability mapping.

### **Data Flow & UX Architecture**
1. **The Capture (Local Strategy):** Person A launches the Mini App, their camera API binds to the layout. They scan Person B's Telegram QR tag (or manually enter `@username`). They snap a selfie.
2. **Context Selection (State Management):** The user checks native pill-button toggles mapped dynamically against local browser `localStorage` profiling tags, firing a pseudo-AI mock data mapping function that formats a fluid introduction message. 
3. **The Dispatch (API Route):** Natively uploads FormData object holding the photo Blob + text mapping payload to our Supabase storage. Supabase returns a `publicUrl` string.
4. **The Viral Loop (Telegraf):** Serverless function forces the Telegram API to DM *both* accounts. Person A receives a "Minted Memory" verification payload. Person B receives a custom dynamic call-to-action driving them directly back into the Inbox of the Mini App UI.
5. **The Closing Hook (Client Routing):** Person B opens their app, the Supabase Postgres database natively maps their Inbox table via `.or(...)` query. Person B clicks "AI Reply", drafts their context, and the App natively manipulates their local system clipboard bypassing Telegram's anti-spam `.openTelegramLink` block, firing them fluently into the official DM!

---

## 🚀 Local Development Setup

### 1. Environment Configuration
Create a `.env.local` file at the root duplicating `.env.example`:
```bash
NEXT_PUBLIC_BASE_URL="https://YOUR_NGROK_URL.ngrok-free.app"

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhb...[KEY]"

# Telegram Bot API Token (from @BotFather)
BOT_TOKEN="123456789:ABCDE..."
```

### 2. Database Initialisation (Supabase)
Run the following SQL snippet natively inside your Supabase project's SQL Editor to format the exact schema required for the connection arrays:
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
*Note: Ensure your `photos` Storage Bucket exists with public reading enabled.*

### 3. Build & Run
```bash
npm install
npm run dev
```

### 4. Exposing your App to Telegram
Because the `@twa-dev/sdk` requires a legitimate nested `https://` proxy running inside the physical application frame on your hardware container, you must tunnel localhost:
```bash
ngrok http 3000
```
Take your ngrok url and assign it to your Telegram Bot via `@BotFather` (`/setmenubutton`).
