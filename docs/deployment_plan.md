# Deployment Plan - VPS (Docker)

This plan outlines how to package and run the application on your VPS.

## Prerequisites
- **VPS** with Docker & Docker Compose installed.
- **Supabase Credentials** (URL & Key).

## Proposed Changes

### [Docker Configuration]
- [NEW] `Dockerfile` - Multi-stage build for Next.js standalone output.
- [NEW] `docker-compose.yml` - Orchestration for the app container.
- [NEW] `.env.production` - Template for production environment variables.

### [Build & Run]
1.  **Build Image:** `docker build -t fortress-app .`
2.  **Run Container:** `docker run -p 3000:3000 --env-file .env.local fortress-app`

## Verification Plan
- Build the Docker image locally to ensure no errors.
- Run the container locally and verify port 3000 responds.
