# prinstine_academy_site

Prinstine Academy public website and admin dashboard.

## Restricted access — read before use

This repository is **restricted**. Do not install, run, modify, or deploy without written approval from the **Primary Developer**.

| | |
|---|---|
| **Primary Developer** | Developer |
| **Contact** | itconsultantbryant@gmail.com |

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
PRINSTINE_PRIMARY_DEV_KEY=your-private-key-at-least-16-chars
```

Create `server/.env` with the same `PRINSTINE_PRIMARY_DEV_KEY` (or `SITE_LIVE=true`).

Without authorization, `npm run dev` will **refuse to start** and print the Primary Developer contact details.
