# prinstine_academy_site

Prinstine Academy public website and admin dashboard.

## Restricted access — read before use

This repository is **restricted**. Do not install, run, modify, or deploy without written approval from the **Primary Developer**.

|                       |                              |
| --------------------- | ---------------------------- |
| **Primary Developer** | Developer                    |
| **Contact**           | itconsultantbryant@gmail.com |

Unauthorized developers must **stop** and contact the Primary Developer before:

- `npm install`
- `npm run dev`
- changing production hosting settings

See [PRIMARY_DEVELOPER.md](./PRIMARY_DEVELOPER.md) for full policy.

## Public site status (maintenance)

The live site is **offline by default**:

1. Visitors see a **loading screen for more than 10 minutes**
2. Then the site shows **404 / unavailable**

To bring the site back online (Primary Developer only), set on **Vercel**:

```env
VITE_SITE_LIVE=true
```

On **Render** (API), set:

```env
SITE_LIVE=true
```

Remove or set to `false` to keep the site down.

## Local development (Primary Developer only)

Create `client/.env.local` (never commit):

```env
VITE_SITE_LIVE=true
VITE_PRINSTINE_PRIMARY_DEV_KEY=your-private-key-at-least-16-chars
```

Create `server/.env` with the same `PRINSTINE_PRIMARY_DEV_KEY` (or `SITE_LIVE=true`).

Without authorization, `npm run dev` will **refuse to start** and print the Primary Developer contact details.

## Deployment on Vercel and Render

### Frontend on Vercel

- Connect this repository to Vercel.
- Set the project root to the repository root.
- Build command: `npm run build`
- Output directory: `client/dist`
- Add frontend environment variables as needed, for example:
  - `VITE_SITE_LIVE=true`
  - `VITE_API_URL=https://your-render-service.onrender.com`

### Backend on Render

- Create a Render Web Service using the `server` folder as the root directory.
- Build command: `npm ci`
- Start command: `npm start`
- Add production environment variables:
  - `NODE_ENV=production`
  - `JWT_SECRET=<32+ character secret>`
  - `CORS_ORIGIN=https://your-vercel-app.vercel.app`
  - `ADMIN_EMAIL=your-admin@example.com`
  - `ADMIN_PASSWORD=super-secure-password`

The frontend uses same-origin `/api` calls in production, and Vercel rewrites them to the Render backend.
