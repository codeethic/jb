# Skill: Add Shared Types and DTOs

Define new domain types, DTOs, enums, or constants in `packages/shared` for use by both the frontend and backend.

## When to Use

Use when a new domain entity needs shared types, when adding a new enum (e.g., a new status), or when adding utility functions that both apps use.

## Location

All shared code lives in `packages/shared/src/` and is imported as `@featureboard/shared`.

## Adding a New Domain Type

### 1. Create the type file

Create `packages/shared/src/types/{domain-name}.ts`:

```typescript
// Import enums if needed
import type { SomeEnum } from '../enums';

/** Read model — dates as ISO strings, optional fields with `?` */
export interface DomainName {
  id: string;
  name: string;
  // ... domain fields
  restaurantId: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;
}

/** Fields required to create a new record */
export interface CreateDomainNameDto {
  name: string;
  // ... required fields
  optionalField?: string;
}

/** All fields optional for partial updates */
export interface UpdateDomainNameDto extends Partial<CreateDomainNameDto> {}

/** Co-locate utility functions when relevant */
export function computeSomething(input: number): number {
  // ...
}
```

### 2. Re-export from barrel

Add to `packages/shared/src/types/index.ts`:

```typescript
export * from './{domain-name}';
```

### 3. Build the shared package

```bash
pnpm --filter @featureboard/shared build
```

## Adding a New Enum

Add to `packages/shared/src/enums/index.ts`:

```typescript
export enum NewEnumName {
  VALUE_ONE = 'value_one',
  VALUE_TWO = 'value_two',
}
```

**Conventions:**
- PascalCase enum name, lowercase string values
- Use string values (not numeric) for readability

## Adding a New Constant

Add to `packages/shared/src/constants/index.ts`:

```typescript
export const NEW_CONSTANTS = [
  'Value One',
  'Value Two',
] as const;

export type NewConstantType = (typeof NEW_CONSTANTS)[number];
```

## Existing Types Reference

| File | Exports |
|------|---------|
| `feature-item.ts` | `FeatureItem`, `CreateFeatureItemDto`, `UpdateFeatureItemDto`, `calculateMargin()` |
| `scheduled-feature.ts` | `ScheduledFeature`, `CreateScheduledFeatureDto`, `UpdateScheduledFeatureDto` |
| `pairing.ts` | `Pairing`, `CreatePairingDto`, `UpdatePairingDto` |
| `user.ts` | `User`, `CreateUserDto`, `UpdateUserDto`, `LoginDto` |
| `category.ts` | `FeatureCategory`, `CreateCategoryDto`, `UpdateCategoryDto` |
| `restaurant.ts` | `Restaurant` |
| `api-response.ts` | `ApiResponse<T>`, `ApiMeta` |

## Existing Enums

| Enum | Values |
|------|--------|
| `MealPeriod` | `lunch`, `dinner` |
| `FeatureStatus` | `draft`, `published`, `86d` |
| `UserRole` | `server`, `chef`, `manager`, `admin` |

## Rules

- **Never** duplicate types between frontend and backend
- **Always** use `import type` when importing in consuming code
- DTOs use TypeScript interfaces (not classes) — validation decorators are backend-only
- `UpdateDto` always extends `Partial<CreateDto>`
- Dates in interfaces are `string` (ISO 8601); entities use `Date`
