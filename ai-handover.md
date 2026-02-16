# Fortress Intelligence: Senior AI Handover & Infrastructure Blueprint

## 🎯 Product Vision (PO Perspective)
Fortress Intelligence is designed as a mission-critical financial analysis engine. The infrastructure Goal is **Zero-Interference Hosting**. The current setup allows the business to scale to dozens of independent "Fortresses" (client instances or new projects) on a single VPS with institutional-grade isolation.

## 🏗️ Architecture & Isolation Strategy
We utilize a **Vertical Sandbox** approach:
- **Process Isolation (PM2)**: Each app is a distinct OS process.
- **Dependency Isolation (Standalone Build)**: We use Next.js `standalone` to lock dependencies per project, preventing "shared library" hell.
- **Port Mapping**: A structured port-range strategy (3000, 3001, etc.) handled by Nginx.
- **Process Level**: Each project runs in a dedicated PM2 process with its own internal port (3000, 3001, etc.).
- **Path Level**: Projects are isolated in `/opt/<project-name>` to avoid permission and directory mess.
- **Network Level**: Nginx acts as a reverse proxy, mapping external domains/IPs to specific internal ports.
- **Data Level**: Every project uses a unique PostgreSQL user and database (see `scripts/create-db-user.sql`).

## CI/CD Pipeline
- **GitHub Actions**: Configured in `.github/workflows/ci.yml`.
- **Workflow**:
  1. Build & Test on every push.
  2. Deploy to VPS via SSH on `main` branch push.
  3. Uses Next.js `standalone` output for minimal package size and maximum performance.

## Key Technical Decisions
1.  **Standalone Output**: Chosen to ensure the VPS deployment is lightweight and doesn't require the full `node_modules` of the development environment.
2.  **Environment Strategy**: PM2 is configured to inject environment variables via the `env_file` directive in `ecosystem.config.js`.
3.  **Basic Auth**: Implemented for admin routes to replace Supabase Auth temporarily during migration.

## Maintenance Commands
```bash
# Update everything
git pull origin main && npm ci && npm run build && pm2 reload fortress-app

# Monitor health
pm2 status
pm2 logs fortress-app
```

## Known "Gotchas"
- **External Firewalls**: Always check the VPS provider's dashboard (Security Groups) if Port 80 is non-responsive, even if `ufw` is set to "Allow".
- **Env Loading**: Next.js Standalone doesn't load `.env` files automatically; they must be provided to the process (handled by PM2).
