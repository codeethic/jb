# Skill: Debug and Troubleshoot FeatureBoard

Diagnose and fix common development issues in the FeatureBoard monorepo.

## When to Use

Use when the user reports errors, the app won't start, tests fail, or something isn't working as expected.

## Diagnostic Steps

### 1. Check Running Services

```powershell
# Is the API running on port 3001?
powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object LocalPort,State,OwningProcess"

# Is the web app running on port 3000?
powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object LocalPort,State,OwningProcess"

# Is PostgreSQL running on port 5432?
powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue | Select-Object LocalPort,State,OwningProcess"
```

### 2. Check Environment Files

Both apps need `.env` files:

```powershell
Test-Path c:\sas\jb\apps\web\.env
Test-Path c:\sas\jb\apps\api\.env
```

**Required API env vars:**
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=featureboard
DATABASE_PASSWORD=featureboard
DATABASE_NAME=featureboard
JWT_SECRET=<any-string>
CORS_ORIGIN=http://localhost:3000
```

**Required Web env vars:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Check Database Connection

```powershell
# Ensure Docker is running PostgreSQL
docker ps --filter "name=postgres" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# If not running:
docker-compose up -d
```

### 4. Check Shared Package Build

If you see "Cannot find module '@featureboard/shared'" errors:

```powershell
cd c:\sas\jb
pnpm --filter @featureboard/shared build
```

### 5. Check Dependencies

```powershell
cd c:\sas\jb
pnpm install
```

## Common Issues and Fixes

### "Cannot find module '@featureboard/shared'"
**Cause:** Shared package not built after type changes.
**Fix:** `pnpm --filter @featureboard/shared build`

### API starts but returns 500 on all routes
**Cause:** Database not connected or not seeded.
**Fix:**
1. `docker-compose up -d` (start Postgres)
2. `pnpm db:migrate` (run migrations)
3. `pnpm db:seed` (seed sample data)

### "401 Unauthorized" on all API calls
**Cause:** JWT token missing, expired, or wrong secret.
**Fix:**
1. Re-login to get a fresh token
2. Verify `JWT_SECRET` in API `.env` matches what was used to sign
3. Check that `localStorage.getItem('token')` returns a valid JWT

### CORS errors in browser console
**Cause:** `CORS_ORIGIN` env var doesn't match the frontend URL.
**Fix:** Set `CORS_ORIGIN=http://localhost:3000` in `apps/api/.env`

### TypeORM "relation does not exist"
**Cause:** Database tables not created.
**Fix:** Enable `synchronize: true` in dev TypeORM config, or run migrations.

### Port already in use
**Cause:** Previous process didn't shut down.
**Fix:**
```powershell
# Find and kill process on port 3001
$proc = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($proc) { Stop-Process -Id $proc.OwningProcess -Force }
```

### Test failures after entity changes
**Cause:** Mock data in spec files doesn't match updated entity shape.
**Fix:** Update mock objects in `*.spec.ts` files to include new/changed fields.

### "pnpm dev" doesn't start both apps
**Cause:** Missing turbo config or script.
**Fix:** Run apps individually:
```powershell
# Terminal 1 — API
pnpm --filter @featureboard/api start:dev

# Terminal 2 — Web
cd c:\sas\jb\apps\web; pnpm dev
```

## Verifying the Full Stack

```powershell
# 1. Test API health
Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing | Select-Object StatusCode

# 2. Test login
$body = @{email="chef@demo.com"; password="password123"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:3001/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$response.Content

# 3. Test authenticated endpoint
$token = ($response.Content | ConvertFrom-Json).data.accessToken
Invoke-WebRequest -Uri "http://localhost:3001/features" -Headers @{Authorization="Bearer $token"} -UseBasicParsing | Select-Object -ExpandProperty Content
```

## Log Locations

- **API logs**: Terminal running `pnpm --filter @featureboard/api start:dev`
- **Web logs**: Terminal running `pnpm --filter @featureboard/web dev`
- **Database logs**: `docker-compose logs postgres`
