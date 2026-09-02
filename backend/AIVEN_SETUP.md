# Aiven MySQL Setup Guide

This guide connects the Veterinary API backend to your existing Aiven for MySQL service.

## 1. Get your connection details from Aiven

1. Log in to the [Aiven Console](https://console.aiven.io/).
2. Select your **project**, then click your **MySQL service**.
3. On the service **Overview** page, find the **Connection information** panel.
4. Copy the following values:

| Field | Env var |
| --- | --- |
| Service host (e.g. `mysql-xxxx.a.aivencloud.com`) | `DB_HOST` |
| Service port (usually `12345` or `3306`) | `DB_PORT` |
| Default user (`avnadmin`) | `DB_USER` |
| Default user password | `DB_PASSWORD` |
| Database name (default `defaultdb`) | `DB_NAME` |

> Tip: the **Service URI** combines all of these — `mysql://avnadmin:password@host:port/defaultdb?ssl-mode=REQUIRED`.

## 2. Download the CA certificate

Aiven requires TLS for all connections.

1. In the service Overview page, click **Download CA certificate** (or use the `ca.pem` link in the connection panel).
2. Save the file somewhere safe, e.g. `backend/certs/ca.pem`.
3. **Do not commit the certificate or `.env` to git** — `certs/` should be added to `.gitignore`.

## 3. Configure the backend

Copy `.env.example` to `.env` (if you haven't already) and fill in:

```env
DB_HOST=your-service-host.a.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb
DB_SSL=true
DB_CA="-----BEGIN CERTIFICATE-----\n...paste full CA cert as one line with \n...\n-----END CERTIFICATE-----"
```

Notes:

- `DB_SSL=true` enables TLS (required by Aiven).
- `DB_CA` must contain the **full certificate contents**. Newlines in `.env` files must be escaped as literal `\n` on a single line, as shown above.
- Alternatively, you can point `DB_CA` at a file path if you prefer to keep the cert on disk — then load it in code with `fs.readFileSync`.

## 4. Create the schema

Apply the existing schema to your Aiven database. From the `backend/` directory:

```bash
mysql --host <DB_HOST> --port <DB_PORT> \
  --user avnadmin -p \
  --ssl-ca certs/ca.pem \
  < db/schema.sql
```

The schema creates the `veterinary_app` database and all tables (users, pets, appointments, invoices, etc.).

> On Aiven's free/hosted plans you may not have permission to `CREATE DATABASE`. If so, remove the `CREATE DATABASE` / `USE` lines from `db/schema.sql` and run it against your existing `defaultdb` database, or create a new database from the Aiven Console under **Databases** and point `DB_NAME` at it.

## 5. (Recommended) Create a dedicated app user

Avoid using `avnadmin` in application code. In the Aiven Console:

1. Go to **Users & roles** → **Add user** (e.g. `veterinary_app`).
2. Grant it privileges on your database via the service's admin user:

```sql
GRANT ALL PRIVILEGES ON veterinary_app.* TO 'veterinary_app';
FLUSH PRIVILEGES;
```

3. Update `DB_USER` / `DB_PASSWORD` in `.env`.

## 6. Verify the connection

Start the backend and hit the health endpoint:

```bash
npm run dev
```

```bash
curl http://localhost:3000/api/health
```

A `200` response confirms the pool connects to Aiven successfully. Common issues:

| Symptom | Fix |
| --- | --- |
| `ETIMEDOUT` / `ECONNREFUSED` | Wrong host/port, or the service is powered off. Check the Overview page. |
| `SELF_SIGNED_CERT_IN_CHAIN` / TLS error | `DB_CA` is missing, truncated, or has unescaped newlines. |
| `Access denied for user` | Wrong password, or the user lacks privileges on `DB_NAME`. |
| `Unknown database` | `DB_NAME` doesn't exist — create it in the console or run the schema. |

## 7. Deployment

When deploying (Railway, Render, Fly.io, etc.), set the same env vars in the platform's environment settings — never commit `.env`. For the CA certificate, either paste its contents into `DB_CA` as a single escaped line or mount it as a secret file.
