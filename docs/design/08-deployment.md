# Design 08: Deployment & Operations

> Parent: [DESIGN.md](../../DESIGN.md)

## Docker Compose

```yaml
services:
  app:      # Next.js :3000, SQLite, local filesystem
  ollama:   # LLM :11434, model weights volume
  cron:     # Alpine + crond: offr-sync, ppr-refresh, comms-check, relist-check
```

## Environment Variables

```env
DATABASE_URL="file:/app/data/hometracker.db"
AUTH_USERS="sarah:pass,john:pass"        # optional
OLLAMA_URL="http://ollama:11434"
OLLAMA_MODEL="llama3"
ANTHROPIC_API_KEY="sk-ant-..."           # optional Claude fallback
CRON_SECRET="secret"                     # optional
```

## Backup

```bash
# Daily cron on host:
sqlite3 /data/hometracker.db ".backup /backups/ht-$(date +%Y%m%d).db"
rsync -a /data/media/ /backups/media/
# Keep 30 days
find /backups -name "ht-*.db" -mtime +30 -delete
```

## First Run

```bash
docker compose up -d
docker exec <ollama> ollama pull llama3
curl -X POST http://localhost:3000/api/seed
# → Open http://localhost:3000/profile to set up buyer profile
```
