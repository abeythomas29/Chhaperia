# Chhaperia Cables Production Tracker

Internal production tracking platform for Chhaperia Cables.

## Apps
- `backend-api`: Node.js + Express API with Prisma
- `admin-web`: React + Vite admin dashboard
- `worker-android`: React Native (Expo) worker app with offline queue + sync

## Quick Start
1. Install dependencies per module:
   - `cd backend-api && npm install`
   - `cd ../admin-web && npm install`
   - `cd ../worker-android && npm install`
2. Start local PostgreSQL (optional, for local run without Supabase):
   - `cd ..`
   - `docker compose up -d`
3. Backend setup:
   - `cd ../backend-api`
   - `cp .env.example .env`
   - set `DATABASE_URL` to your PostgreSQL/Supabase database URL
   - `npx prisma db push`
   - `npm run seed`
   - `npm run dev`
4. Web app:
   - `cd ../admin-web`
   - `cp .env.example .env`
   - `npm run dev`
5. Mobile app:
   - `cd ../worker-android`
   - `cp .env.example .env`
   - `npm run start`

## Default Demo Credentials
- Super Admin: `superadmin` / `superadmin123`
- Admin: `manager1` / `manager123`
- Worker: `EMP001` / `worker123`

## Notes
- Current product scope includes only Semiconductor Woven Water Blocking Tape and codes CHSCWWBT 18, 20, 22, 25.
- Architecture supports adding new categories/codes via admin panel without code changes.

## Data Storage
- Production data is stored in PostgreSQL via Prisma.
- You can use:
  - Supabase Postgres
  - Render Postgres
  - Railway Postgres
- The storage connection is configured through:
  - `backend-api/.env` -> `DATABASE_URL`

## Deploy Admin Panel to Vercel
1. Push repository to GitHub.
2. In Vercel, import repository and set:
   - Root Directory: `admin-web`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>`
4. Deploy.

Project is preconfigured with:
- `/Users/abeythomas/Chhaperia production tracker/admin-web/vercel.json`

CLI deploy (if you have Vercel token):
- `cd /Users/abeythomas/Chhaperia production tracker/admin-web`
- `npx vercel --prod --yes`

## Deploy Backend to Render (Server + Database)
Use blueprint deploy with:
- `/Users/abeythomas/Chhaperia production tracker/render.yaml`

This provisions:
- Node backend service (`backend-api`)
- Managed PostgreSQL database

After deploy, set:
- `CORS_ORIGIN=https://<your-vercel-domain>`

Run database setup once (Render Shell):
- `npx prisma db push`
- `npm run seed`

Note:
- Backend service start command is `npm run start` only.
- Do not run `prisma db push` + `seed` on every startup; it causes slow cold boots.

Alternative backend hosting:
- Railway/Fly/AWS are also supported as long as `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` are configured.
- Railway config included: `/Users/abeythomas/Chhaperia production tracker/backend-api/railway.json`

## Supabase Option
- Yes, you can use Supabase as database storage.
- Create a Supabase project and copy its Postgres connection string.
- Set that string as `DATABASE_URL` in backend environment.
- Then run:
  - `npx prisma db push`
  - `npm run seed`

## Backend + Mobile Hosting Notes
- `backend-api` should be hosted on a Node server platform (Render, Railway, Fly.io, AWS, etc.), not static hosting.
- `worker-android` cannot be hosted on Vercel/Netlify; it is a mobile app and should be distributed through APK/Test builds.
