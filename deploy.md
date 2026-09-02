# PawCare Deployment Guide

This guide explains how to download this project, split the `frontend/` and `backend/` folders into separate repositories, configure them, and deploy them online.

## 1. Understand the project

- `frontend/` is a React 19 + Vite + TypeScript application.
- `backend/` is an Express 5 + TypeScript API.
- The backend uses MySQL.
- The frontend calls API routes under `/api/...`.
- Authentication uses a JWT stored by the frontend in `localStorage` under `pawcare_token`.

You can deploy the two applications independently:

```text
Frontend hosting  --->  Backend API hosting  --->  MySQL database
```

The frontend must know the public URL of the backend in production.

---

## 2. Split the downloaded project into two repositories

After downloading and extracting the ZIP:

1. Create a new repository for the frontend.
2. Copy the complete `frontend/` directory into that repository.
3. Create a new repository for the backend.
4. Copy the complete `backend/` directory into that repository.
5. Do not upload `backend/.env`, database passwords, JWT secrets, or certificates.
6. Keep each repository's `package.json` and lockfile (`package-lock.json`) together.

A typical split looks like this:

```text
pawcare-frontend/
  package.json
  package-lock.json
  vite.config.ts
  src/

pawcare-backend/
  package.json
  package-lock.json
  tsconfig.json
  db/
  src/
  .env.example
```

The root `README.md` and this `deploy.md` can be copied into either repository or kept in a separate project-notes repository.

---

## 3. Required software

Install these locally before testing:

- Node.js 20 or newer
- npm
- MySQL client (needed to apply the schema manually)
- Git

Check Node and npm:

```bash
node --version
npm --version
```

Run `npm install` separately inside both repositories. Do not run it from the parent folder unless you create a workspace intentionally.

---

## 4. Configure and run the backend locally

From the backend repository:

```bash
cd backend
npm install
cp .env.example .env
```

On Windows, copy `.env.example` to `.env` manually if `cp` is unavailable.

Edit `.env` with your MySQL settings:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=veterinary_app
DB_SSL=false

# Use a long, random value in production.
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

Create the database tables:

```bash
npm run db:schema
```

Start the development server:

```bash
npm run dev
```

The API should be available at `http://localhost:3000`.

Check it:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/landing
```

For a successful database health check, `/api/health` should return JSON with `"status":"ok"` and `"database":"connected"`.

### Backend production build

Before deployment, verify that the backend compiles and starts from its compiled output:

```bash
npm run build
npm start
```

The production server runs `dist/index.js`. Your hosting provider should use:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`

Most hosting providers set a `PORT` environment variable automatically. The backend already reads `PORT`; do not hard-code the production port.

---

## 5. Configure the production MySQL database

Create a hosted MySQL database with your chosen database provider. Copy its connection values into the backend hosting provider's environment settings:

```env
DB_HOST=your-public-mysql-host
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_SSL=true
JWT_SECRET=your_long_random_production_secret
JWT_EXPIRES_IN=7d
```

For Aiven MySQL, see `backend/AIVEN_SETUP.md`. Aiven usually requires a CA certificate and these additional settings:

```env
DB_SSL=true
DB_CA=-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
```

Use the exact values and TLS instructions supplied by your database provider. Never commit the certificate or `.env` file.

Apply `backend/db/schema.sql` to the production database before using the deployed API. You can either:

```bash
mysql --host YOUR_HOST --port YOUR_PORT --user YOUR_USER -p YOUR_DATABASE < db/schema.sql
```

or use the database provider's SQL console. If the provider does not allow `CREATE DATABASE`, select the already-created database and omit the `CREATE DATABASE` / `USE` statements from the SQL import.

### Important production database checklist

- Use a dedicated application database user instead of an administrator account.
- Enable SSL/TLS when the provider requires it.
- Restrict database network access if the provider supports allowlists.
- Back up the database before schema changes.
- Do not expose database credentials in frontend variables.

---

## 6. Deploy the backend

Choose a Node.js-compatible host. The exact dashboard names vary, but the process is the same:

1. Create a new web service from the backend repository.
2. Select the Node.js runtime.
3. Set the build command to `npm run build`.
4. Set the start command to `npm start`.
5. Add all production environment variables from the previous section.
6. Deploy the service.
7. Copy the public backend URL, for example:

```text
https://pawcare-api.example.com
```

8. Verify these URLs in a browser or with `curl`:

```bash
curl https://pawcare-api.example.com/
curl https://pawcare-api.example.com/api/health
curl https://pawcare-api.example.com/api/landing
```

The backend URL must be HTTPS in production.

### CORS

The current backend uses `app.use(cors())`, so cross-origin requests are enabled. This is convenient during initial deployment. Once the frontend URL is final, restrict CORS to that URL for better security, for example:

```ts
app.use(cors({
  origin: 'https://pawcare.example.com',
}))
```

If you make this change, replace the example with the actual frontend origin and redeploy the backend. Do not include a trailing slash in the origin.

---

## 7. Configure the frontend to call the deployed backend

The frontend API wrapper is in `frontend/src/lib/api.ts`. It currently uses:

```ts
const API_BASE = import.meta.env.VITE_API_URL || ''
```

All API calls are then made as paths such as:

```ts
fetch(`${API_BASE}/api/landing`)
fetch(`${API_BASE}/api/auth/login`, { method: 'POST', ... })
fetch(`${API_BASE}/api/pets`, { ... })
```

This means the production frontend needs the Vite environment variable:

```env
VITE_API_URL=https://pawcare-api.example.com
```

Do not add `/api` to `VITE_API_URL`, because the code already adds `/api/...` to the base URL.

Correct:

```env
VITE_API_URL=https://pawcare-api.example.com
```

Incorrect:

```env
VITE_API_URL=https://pawcare-api.example.com/api
```

Vite embeds variables beginning with `VITE_` into browser JavaScript. Therefore, `VITE_API_URL` is not secret. Never put database passwords or `JWT_SECRET` in frontend environment variables.

### Frontend local development

From the frontend repository:

```bash
cd frontend
npm install
npm run dev
```

Without `VITE_API_URL`, the frontend uses relative `/api` URLs. `frontend/vite.config.ts` proxies these URLs to `http://localhost:3000`, so keep the backend running locally on port 3000.

If your local backend uses another port, set the proxy target before starting Vite:

```bash
VITE_API_PROXY_TARGET=http://localhost:4000 npm run dev
```

On Windows PowerShell:

```powershell
$env:VITE_API_PROXY_TARGET="http://localhost:4000"; npm run dev
```

### Frontend production build

Run:

```bash
npm run typecheck
npm run build
```

The static files are written to `dist/`. Your frontend host should use:

- **Build command:** `npm install && npm run build`
- **Publish/output directory:** `dist`
- **Environment variable:** `VITE_API_URL=https://pawcare-api.example.com`

Because Vite variables are read at build time, redeploy/rebuild the frontend whenever `VITE_API_URL` changes.

---

## 8. Deploy the frontend

Deploy the frontend repository to a static hosting provider that supports Vite:

1. Create a new static site from the frontend repository.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add `VITE_API_URL` with the deployed backend URL.
5. Deploy the site.
6. Copy the public frontend URL.
7. Add that URL to the backend CORS allowlist if you restricted CORS.
8. Redeploy the backend after changing CORS.

The frontend does not need Node.js running continuously after the build; it is a collection of static assets.

### Client-side routing

The application uses React Router. Configure the frontend host to rewrite unknown routes to `index.html`. Without this rewrite, refreshing routes such as `/login`, `/register`, or dashboard routes may return a host-level 404.

The setting is commonly called one of these:

- SPA fallback
- Rewrite all routes to `/index.html`
- History API fallback

Use the equivalent setting for your hosting provider.

---

## 9. How frontend API calls work

The shared request helper in `frontend/src/lib/api.ts` does the following:

1. Combines `VITE_API_URL` with an API path.
2. Sends JSON using `Content-Type: application/json`.
3. Reads the JWT from `localStorage`.
4. Adds `Authorization: Bearer <token>` when a token exists.
5. Parses errors from the backend's `{ "error": "..." }` response.

Example login call:

```ts
const result = await loginUser(email, password)
storeToken(result.data.token)
```

Example authenticated request:

```ts
const result = await fetchCurrentUser()
console.log(result.data.email)
```

Example pet request:

```ts
const pets = await fetchPets(user.id)
const created = await createPet(user.id, {
  name: 'Milo',
  species: 'dog',
  sex: 'male',
})
```

When calling the backend directly from another frontend component, follow the same pattern:

```ts
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/example`, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('pawcare_token') ?? ''}`,
  },
})

if (!response.ok) {
  throw new Error('The API request failed')
}

const data = await response.json()
```

Prefer adding new calls to `frontend/src/lib/api.ts` instead of duplicating this logic throughout components.

### Current API paths

| Method | Path | Authentication |
| --- | --- | --- |
| GET | `/` | No |
| GET | `/api/health` | No |
| GET | `/api/health/db` | No |
| GET | `/api/landing` | No |
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Bearer JWT |
| POST | `/api/auth/logout` | Bearer JWT |
| GET | `/api/users` | See backend route authorization |
| GET | `/api/users/:id` | See backend route authorization |
| POST | `/api/users` | See backend route authorization |
| PATCH | `/api/users/:id` | See backend route authorization |
| DELETE | `/api/users/:id` | See backend route authorization |
| GET | `/api/pets?owner_id=USER_ID` | Bearer JWT expected by application flow |
| GET | `/api/pets/:id` | Bearer JWT expected by application flow |
| POST | `/api/pets` | Bearer JWT expected by application flow |
| PATCH | `/api/pets/:id` | Bearer JWT expected by application flow |
| DELETE | `/api/pets/:id` | Bearer JWT expected by application flow |

Check the route files in `backend/src/routes/` for the exact request body and authorization behavior before adding new integrations.

---

## 10. End-to-end production verification

After both services are deployed:

1. Open the backend root URL and confirm it returns `Veterinary API` JSON.
2. Open `/api/health` and confirm the database is connected.
3. Open the frontend URL.
4. Open browser developer tools and inspect the Network tab.
5. Confirm frontend requests go to the deployed backend URL, not `localhost`.
6. Register a test account.
7. Confirm the registration response contains a token.
8. Refresh the page and confirm `/api/auth/me` restores the session.
9. Log in and log out.
10. Create, list, and delete a test pet.
11. Test refreshing `/login`, `/register`, and dashboard routes directly.
12. Confirm browser requests do not show CORS errors.
13. Remove test data if necessary.

Useful checks:

```bash
curl -i https://pawcare-api.example.com/api/health
curl -i https://pawcare-api.example.com/api/landing
```

A browser CORS error usually means one of these is wrong:

- The frontend is using the wrong `VITE_API_URL`.
- The backend CORS origin does not match the frontend origin.
- The backend URL is HTTP while the frontend is HTTPS.
- The backend deployment is down or its port/start command is incorrect.

---

## 11. Security checklist before launch

- [ ] Replace the development `JWT_SECRET` with a long random production secret.
- [ ] Set production database credentials only in the backend host's secret settings.
- [ ] Never commit `.env`, certificates, or passwords.
- [ ] Use HTTPS for both frontend and backend.
- [ ] Restrict CORS to the real frontend origin.
- [ ] Use a least-privilege database user.
- [ ] Enable database TLS where required.
- [ ] Configure database backups.
- [ ] Do not expose `DB_*` or `JWT_SECRET` through `VITE_*` variables.
- [ ] Review authorization rules before exposing staff/admin endpoints publicly.
- [ ] Consider replacing localStorage JWT storage with a secure, HttpOnly cookie strategy if the security requirements increase.
- [ ] Disable or protect verbose database diagnostics such as `/api/health/db` in a public production environment if they reveal infrastructure details.

---

## 12. Recommended deployment order

Use this order to avoid configuration loops:

1. Create the production MySQL database.
2. Apply `db/schema.sql`.
3. Deploy the backend with database credentials.
4. Verify `/api/health` and `/api/landing`.
5. Copy the backend public URL.
6. Deploy the frontend with `VITE_API_URL` set to that backend URL.
7. Copy the frontend public URL.
8. Restrict backend CORS to the frontend URL.
9. Redeploy the backend.
10. Complete the end-to-end verification checklist.

When a deployment fails, inspect the service build logs first, then runtime logs, then browser Network/Console errors. Most issues are caused by an incorrect start command, missing environment variable, database TLS configuration, CORS origin, or missing SPA route rewrite.
