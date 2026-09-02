# Veterinary API backend

## Local MySQL setup

1. Ensure MySQL Server is running locally.
2. Copy `.env.example` to `.env` and set `DB_PASSWORD`.
3. Create the database and tables:

```bash
mysql -u root -p < db/schema.sql
```

The default local configuration connects to `127.0.0.1:3306` and the `veterinary_app` database.

## Aiven configuration

See [AIVEN_SETUP.md](./AIVEN_SETUP.md) for a full step-by-step guide.

The same TypeScript connection code supports Aiven. Set the Aiven host, port, user, password, and database in the deployment environment, then enable TLS:

```env
DB_SSL=true
DB_CA="-----BEGIN CERTIFICATE-----\nYOUR_AIVEN_CA_CERTIFICATE\n-----END CERTIFICATE-----"
```

Use the CA certificate downloaded from the Aiven service. Do not commit `.env` files or certificates.

## Run the TypeScript API

Development with watch mode:

```bash
npm run dev
```

Production build and start:

```bash
npm run build
npm start
```

The database health endpoint is available at `GET /api/health`.
