# Heli Charter Quoter

Charter quoting tool for Blue Hill Helicopters. Plug in ICAO codes, pick an
aircraft, and get an itemized quote with great-circle flight times, a
wait-vs-ferry cost analysis, an editable landing-fee ledger, and a
client-ready PDF export.

## Run it locally

You need Node.js 18 or newer (https://nodejs.org).

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Deploy to Vercel (recommended)

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Charter quoter"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/heli-charter-quoter.git
   git push -u origin main
   ```
2. Go to https://vercel.com, sign in with GitHub, and click **Add New → Project**.
3. Import the repo. Vercel auto-detects Vite — accept the defaults and click **Deploy**.
4. (Optional) Under Settings → Domains, add a custom domain such as
   `quotes.bluehillhelicopters.com` and follow the DNS prompt.

Netlify and Cloudflare Pages work the same way: import the repo,
build command `npm run build`, output directory `dist`.

## Things to know

- **Data storage:** fees, fleet, locations, and company/letterhead settings are
  saved in the browser's localStorage. They persist on that machine/browser
  but are not shared between devices or users. For a shared team ledger,
  wire the load/save block in `src/App.jsx` (search for `STORAGE_KEY`) to a
  database such as Supabase or Firebase.
- **PDF export:** uses the browser print dialog — click "Export client PDF,"
  then "Print / Save as PDF" and choose *Save as PDF* as the destination.
- **Landing fees and coordinates:** the ~115 bundled New England / NY-corridor
  facilities use approximate coordinates (within ~1 nm) and placeholder
  landing fees. Verify fees against actual facility invoices in the Admin tab.
- **Quotes are estimates:** flight times are great-circle distance at cruise
  speed plus a per-leg buffer; actual times vary with wind, routing, and ATC.
