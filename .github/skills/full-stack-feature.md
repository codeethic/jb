# Skill: Add a Full-Stack Feature End-to-End

Implement a complete feature across the entire stack: shared types → backend API → frontend UI.

## When to Use

Use when the user asks for a new capability that spans the full stack (e.g., "add wine pairing management", "build the reports page", "implement feature scheduling UI").

## Execution Order

Always work **bottom-up** to avoid broken imports:

### Phase 1 — Shared Types (`packages/shared`)

1. Define domain interfaces and DTOs in `packages/shared/src/types/{domain}.ts`
2. Add any new enums to `packages/shared/src/enums/index.ts`
3. Add any new constants to `packages/shared/src/constants/index.ts`
4. Re-export from `packages/shared/src/types/index.ts`
5. Build: `pnpm --filter @featureboard/shared build`

### Phase 2 — Backend API (`apps/api`)

1. **Entity** — `apps/api/src/{domain}/{name}.entity.ts`
2. **Repository interface** — `apps/api/src/{domain}/{name}.repository.ts`
3. **TypeORM implementation** — `apps/api/src/{domain}/typeorm-{name}.repository.ts`
4. **Service** — `apps/api/src/{domain}/{domain}.service.ts`
5. **Controller** — `apps/api/src/{domain}/{domain}.controller.ts`
6. **Module** — `apps/api/src/{domain}/{domain}.module.ts`
7. **Register** in `apps/api/src/app.module.ts`
8. **Unit tests** — `apps/api/src/{domain}/{domain}.service.spec.ts`

### Phase 3 — Frontend (`apps/web`)

1. **Page** — `apps/web/src/app/{route}/page.tsx`
2. **Components** — `apps/web/src/components/{domain}/` (if complex)
3. Uses `apiFetch<T>` from `@/lib/api`
4. Types imported from `@featureboard/shared`

### Phase 4 — Verify

1. Restart API: `pnpm --filter @featureboard/api start:dev`
2. Test API endpoint with curl/PowerShell
3. Verify frontend page loads and displays data
4. Run tests: `pnpm --filter @featureboard/api test`

## Role-Based Access Quick Reference

| Operation | Allowed Roles |
|-----------|---------------|
| View/Read | Server, Chef, Manager, Admin |
| Create/Edit | Chef, Manager, Admin |
| Delete | Manager, Admin |
| Approve/Publish | Manager, Admin |
| User Management | Admin |
| System Config | Admin |

## API Response Envelope

All responses are automatically wrapped by `ResponseEnvelopeInterceptor`:
```json
{
  "data": { /* result */ },
  "error": null,
  "meta": {}
}
```

Error responses are handled by `HttpExceptionFilter`:
```json
{
  "data": null,
  "error": "Error message"
}
```

Controllers return raw data — never manually wrap in the envelope.

## Architecture Invariants

- Controllers: HTTP concerns only (parse request → call service → return)
- Services: Business logic only (no HTTP, no TypeORM imports)
- Repositories: Data access only (injected via Symbol interface)
- All queries scoped to `restaurantId` from JWT
- UUIDs for all primary keys
- Dates as ISO 8601 strings in DTOs, `Date` objects in entities
