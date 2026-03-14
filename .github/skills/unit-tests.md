# Skill: Write Unit Tests for NestJS Services

Write comprehensive unit tests for FeatureBoard API services following established patterns.

## When to Use

Use when the user asks to write tests for a service, or when creating a new module that needs test coverage. Target ≥ 80% line coverage for `apps/api/src`.

## Test File Convention

- File: `{domain-plural}.service.spec.ts` colocated next to the service
- Uses NestJS `Test.createTestingModule` utilities
- Repositories mocked as plain objects with `jest.fn()`
- `jest.clearAllMocks()` in `beforeEach`

## Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DomainService } from './{domain-plural}.service';
import { DOMAIN_REPOSITORY } from './{domain-name}.repository';

// 1. Realistic mock data at top level
const mockItem = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  // ... all entity fields with realistic values
  restaurantId: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 2. Mock repository — all interface methods as jest.fn()
const mockRepo = {
  findById: jest.fn(),
  findAllByRestaurant: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  // ... any domain-specific methods
};

describe('DomainService', () => {
  let service: DomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainService,
        { provide: DOMAIN_REPOSITORY, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<DomainService>(DomainService);
    jest.clearAllMocks();
  });

  // 3. Group by method
  describe('findAll', () => {
    it('should return all items for a restaurant', async () => {
      mockRepo.findAllByRestaurant.mockResolvedValue([mockItem]);
      const result = await service.findAll(mockItem.restaurantId);
      expect(result).toHaveLength(1);
      expect(mockRepo.findAllByRestaurant).toHaveBeenCalledWith(mockItem.restaurantId);
    });
  });

  describe('findById', () => {
    it('should return item when found', async () => {
      mockRepo.findById.mockResolvedValue(mockItem);
      const result = await service.findById(mockItem.id);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return item', async () => {
      mockRepo.create.mockResolvedValue(mockItem);
      const dto = { /* ... minimal required fields */ };
      const result = await service.create(dto, mockItem.restaurantId);
      expect(result).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update when item exists', async () => {
      mockRepo.findById.mockResolvedValue(mockItem);
      mockRepo.update.mockResolvedValue({ ...mockItem, name: 'Updated' });
      const result = await service.update(mockItem.id, { name: 'Updated' });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete when item exists', async () => {
      mockRepo.findById.mockResolvedValue(mockItem);
      mockRepo.delete.mockResolvedValue(undefined);
      await expect(service.delete(mockItem.id)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
```

## Checklist

- [ ] Mock data uses realistic UUID strings (`550e8400-e29b-...`)
- [ ] All repository interface methods present in mock object
- [ ] Tests grouped by method in nested `describe` blocks
- [ ] Both success and error paths tested for each method
- [ ] `mockResolvedValue` / `mockRejectedValue` used appropriately
- [ ] Margin calculations tested with `toBeCloseTo(expected, 1)` when applicable
- [ ] Auth-related tests use real `bcrypt` for password verification
- [ ] No database, HTTP, or external service calls in unit tests
- [ ] `jest.clearAllMocks()` in `beforeEach` to reset state

## Running Tests

```bash
pnpm --filter @featureboard/api test              # all tests
pnpm --filter @featureboard/api test -- --watch    # watch mode
pnpm --filter @featureboard/api test -- --coverage # with coverage
```
