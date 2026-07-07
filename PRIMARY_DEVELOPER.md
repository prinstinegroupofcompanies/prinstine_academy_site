# Primary Developer access policy

## Contact

| Field     | Value                        |
| --------- | ---------------------------- |
| **Name**  | Developer                    |
| **Role**  | Primary Developer            |
| **Email** | itconsultantbryant@gmail.com |

## For all other developers

If you cloned or downloaded this repository:

1. **Do not** run `npm install` for the purpose of running this site in production.
2. **Do not** run `npm run dev`, `npm start`, or deploy without written approval.
3. **Contact the Primary Developer first** at **itconsultantbryant@gmail.com**.

If you proceed without authorization:

- Local dev scripts will **block startup**.
- The public website remains in **maintenance mode** (long loading, then 404).
- The API remains in **maintenance mode** (delayed responses, then 404).

## For the Primary Developer only

### Take the public site offline (default)

Ensure these are **not** set (or set to `false`) on hosting:

- Vercel: `VITE_SITE_LIVE`
- Render: `SITE_LIVE`

Redeploy after changes.

### Bring the site online

**Vercel**

```env
VITE_SITE_LIVE=true
```

**Render**

```env
SITE_LIVE=true
```

### Work locally

`client/.env.local`:

```env
VITE_SITE_LIVE=true
VITE_PRINSTINE_PRIMARY_DEV_KEY=choose-a-long-private-secret
```

`server/.env`:

```env
SITE_LIVE=true
PRINSTINE_PRIMARY_DEV_KEY=same-secret-as-above
```

Then:

```bash
npm run dev          # frontend (from repo root)
npm run dev:server   # backend
```

Never commit `.env.local` or secrets.
