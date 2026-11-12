# Krishna Raj & Kumari Archana — Wedding Invitation Website

A responsive, bilingual (Hindi & English) React + Tailwind wedding invitation website with Supabase RSVP storage, a gallery lightbox, and a protected admin dashboard.

## 1. Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- A Supabase project for RSVP storage and admin login

## 2. Install and run
```powershell
cd wedding-invitation-website
npm install
Copy-Item .env.example .env
npm run dev
```
Open the local URL printed by Vite (usually `http://localhost:5173`).

## 3. Connect Supabase
1. Create a project at https://supabase.com/
2. Open **Project Settings > API**.
3. Copy Project URL and `anon` / public key into `.env`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
4. In Supabase **SQL Editor**, run `supabase/schema.sql`.
5. In **Authentication > Users**, create an admin user with an email and strong password.
6. Restart `npm run dev`.

Public visitors can `INSERT` RSVP rows, and only authenticated admin users can `SELECT` RSVP rows. Open the admin panel from the **Admin** button in the footer.

Important: the `anon` key is designed for browser use when Row Level Security is enabled. Never place a Supabase `service_role` key in this frontend app.

## 4. Add couple & gallery photos
Put your photos in `public/images/` with these filenames:
- `groom.jpg`
- `bride.jpg`
- `couple.jpg`

Both the Bride & Groom section (`groom.jpg`, `bride.jpg`) and the Gallery (`groom.jpg`, `bride.jpg`, `couple.jpg`, with interactive lightbox preview) automatically display these images once added.

## 5. Add wedding music
Add a royalty-free or family-approved MP3 file at:
`public/music/wedding-music.mp3`

Guests can toggle music playback from the music icon in the header.

## 6. Verified card details
All Hindi & English details match the printed wedding card:
- Groom: **आयुष्मान् कृष्णा राज** (Son of Smt. Rani Devi & Shri Manoj Sah)
- Bride: **आयुष्मती कुमारी अर्चना** (Daughter of Smt. Punam Devi & Shri Bhola Sah · Tinpokhariya, Mali Ghat, Muzaffarpur)
- Venue: **विणा विवाह भवन, नकुलवा चौक, मुजफ्फरपुर**
- Sender / Family Residence: **श्री मनोज साह · ग्राम — मनोरा, पो० — बीबीपुर, थाना — बेलसर, वैशाली**
- Hosts (आकांक्षी): **दिलीप साह एवं राम नरेश साह**
- Looking forward (दर्शनाभिलाषी): **सन्नी कुमार सोनी, शेखर साह, सागर साह एवं समस्त साह परिवार**
- Child's invite (बाल आग्रह): **किट्टू राज**
- Contact mobile: **9939276695**

Before launch, verify the exact Google Maps pin for **विणा विवाह भवन, नकुलवा चौक, मुजफ्फरपुर** and confirm the 26 & 29 November timings if finalized.

## 7. Build for production
```powershell
npm run build
npm run preview
```
Deploy the generated `dist/` folder to Vercel, Netlify, or another static host, and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting environment variables.
