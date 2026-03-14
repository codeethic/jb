# Skill: Add or Update Seed Data

Extend the database seed script with new sample data for development and testing.

## When to Use

Use when adding a new entity that needs sample data, or when the user wants to reset/extend the development database.

## Seed Script Location

`apps/api/src/database/seed.ts`

## Conventions

- Seed script runs via `pnpm db:seed`
- Uses TypeORM `DataSource` to connect and insert
- Creates data in dependency order: Restaurant → Users → Categories → Feature Items → Scheduled Features → Pairings
- Uses realistic restaurant data (not lorem ipsum)
- Each entity gets 3-5 sample records minimum
- Uses deterministic UUIDs (e.g., `550e8400-e29b-41d4-a716-44665544XXXX`) for cross-references
- Passwords hashed with `bcrypt` (rounds=10)
- Wraps inserts in a transaction
- Idempotent: checks for existing data or clears before reseeding

## Adding Seed Data for a New Entity

```typescript
// 1. Import the entity
import { NewEntity } from '../{domain}/{name}.entity';

// 2. Get the repository inside the seed function
const newRepo = dataSource.getRepository(NewEntity);

// 3. Insert sample records
await newRepo.save([
  {
    id: '550e8400-e29b-41d4-a716-446655440060',
    name: 'Sample Record 1',
    restaurantId: restaurantId, // reference the seeded restaurant
    // ... other fields with realistic values
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440061',
    name: 'Sample Record 2',
    restaurantId: restaurantId,
  },
]);
```

## Sample Users (Already Seeded)

| Email | Password | Role |
|-------|----------|------|
| `admin@demo.com` | `password123` | Admin |
| `manager@demo.com` | `password123` | Manager |
| `chef@demo.com` | `password123` | Chef |
| `server@demo.com` | `password123` | Server |

## Running

```bash
# Seed the database
pnpm db:seed

# Reset database and reseed (if supported)
pnpm db:migrate && pnpm db:seed
```

## Tips

- Always add the new entity to the TypeORM `DataSource` entities array
- Use `ON CONFLICT DO NOTHING` or `upsert` for idempotency when possible
- Reference existing seeded restaurant/user/category IDs for foreign keys
- Include a mix of data states (e.g., draft + published features, active + inactive items)
