# Docker Deployment

Wordenstein is deployed as one Docker Compose project with two runtime services:

- `wordenstein`: the Next.js app, exposed to the VPS on `127.0.0.1:8080`.
- `lemma`: the private FastAPI lemmatization service, reachable only inside the Compose network at `http://lemma:8000`.

nginx should continue to route the public app domain to `127.0.0.1:8080`. The old public lemma virtual host should be removed or disabled after the Compose deployment is verified.

## VPS Prerequisite

Docker Engine and the Docker Compose plugin must be installed on the VPS before the GitHub Actions deploy workflow can run successfully.

## Runtime Data

The app keeps persistent data on the host and mounts it into the `wordenstein` container:

- `./database:/app/database`
- `./uploads:/app/uploads`

The deploy workflow excludes `database/prod.db` and `uploads` from rsync so production data is not overwritten.

## Environment

The existing `.env` remains the single environment file for the product. It must include:

- `DATABASE_URL`
- `VSEGPT_API_KEY`
- `LEMMA_API_KEY`

Compose injects `LEMMA_API_URL=http://lemma:8000` for the app container and passes `LEMMA_API_KEY` to the lemma container as `API_KEY`.

## Deploy Flow

The GitHub Actions workflow uploads this repository to the VPS, then runs:

```bash
docker compose build
docker compose run --rm wordenstein npx prisma migrate deploy --schema=./database/schema.prisma
docker compose up -d
docker compose ps
```

The old PM2 Wordenstein process and old Uvicorn lemma process are stopped during deployment.
