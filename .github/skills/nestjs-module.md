# Skill: Scaffold a New NestJS Domain Module

Scaffold a complete NestJS domain module for the FeatureBoard API following established patterns.

## When to Use

Use this skill when the user asks to add a new domain/resource to the backend API (e.g., "add a reports module", "create an inventory module").

## Steps

### 1. Define the Domain

Ask for or infer: **domain name** (singular, e.g., `report`), **table name** (plural snake_case, e.g., `performance_records`), and the list of fields with types.

### 2. Create Shared Types in `packages/shared`

Create `packages/shared/src/types/{domain-name}.ts`:

```typescript
// 1. Read-model interface — dates as string, optional fields with `?`
export interface DomainName {
  id: string;
  // ... fields
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Create DTO — required fields for creation
export interface CreateDomainNameDto {
  // ... writable fields, some optional with `?`
}

// 3. Update DTO — always Partial of Create
export interface UpdateDomainNameDto extends Partial<CreateDomainNameDto> {}
```

Re-export from `packages/shared/src/types/index.ts`:
```typescript
export * from './{domain-name}';
```

### 3. Create Entity — `apps/api/src/{domain-plural}/{domain-name}.entity.ts`

Follow these conventions:
- `@Entity('{table_name}')` — snake_case plural
- `@PrimaryGeneratedColumn('uuid')` for `id!: string`
- Use definite assignment (`!:`) on all fields, never `?`
- Nullable columns: `@Column({ type: 'text', nullable: true })` typed as `string | null`
- Decimals: `@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })`
- JSON arrays: `@Column({ type: 'jsonb', default: '[]' })` typed as `string[]`
- Enums: `@Column({ type: 'enum', enum: EnumName })` imported from `@featureboard/shared`
- Foreign keys: explicit `@Column({ type: 'uuid' })` + `@ManyToOne(() => RelatedEntity, { eager: true })` + `@JoinColumn({ name: 'columnName' })`
- Always end with `@CreateDateColumn() createdAt!: Date;` and `@UpdateDateColumn() updatedAt!: Date;`
- Always include `@Column({ type: 'uuid' }) restaurantId!: string;`

### 4. Create Repository Interface — `apps/api/src/{domain-plural}/{domain-name}.repository.ts`

```typescript
import type { DomainEntity } from './{domain-name}.entity';

export interface IDomainRepository {
  findById(id: string): Promise<DomainEntity | null>;
  findAllByRestaurant(restaurantId: string): Promise<DomainEntity[]>;
  create(item: Partial<DomainEntity>): Promise<DomainEntity>;
  update(id: string, data: Partial<DomainEntity>): Promise<DomainEntity | null>;
  delete(id: string): Promise<void>;
  // Add domain-specific finders as needed
}

export const DOMAIN_REPOSITORY = Symbol('DOMAIN_REPOSITORY');
```

- Interface name: `I{DomainName}Repository`
- Token: `UPPER_SNAKE_CASE` Symbol constant
- Use `import type` for the entity

### 5. Create TypeORM Implementation — `apps/api/src/{domain-plural}/typeorm-{domain-name}.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainEntity } from './{domain-name}.entity';
import type { IDomainRepository } from './{domain-name}.repository';

@Injectable()
export class TypeOrmDomainRepository implements IDomainRepository {
  constructor(
    @InjectRepository(DomainEntity)
    private readonly repo: Repository<DomainEntity>,
  ) {}

  async findById(id: string): Promise<DomainEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAllByRestaurant(restaurantId: string): Promise<DomainEntity[]> {
    return this.repo.find({ where: { restaurantId }, order: { createdAt: 'DESC' } });
  }

  async create(item: Partial<DomainEntity>): Promise<DomainEntity> {
    const entity = this.repo.create(item);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<DomainEntity>): Promise<DomainEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
```

- Private field always named `repo`
- `update` always re-fetches after updating

### 6. Create Service — `apps/api/src/{domain-plural}/{domain-plural}.service.ts`

```typescript
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { CreateDomainDto, UpdateDomainDto } from '@featureboard/shared';
import type { IDomainRepository } from './{domain-name}.repository';
import { DOMAIN_REPOSITORY } from './{domain-name}.repository';

@Injectable()
export class DomainPluralService {
  constructor(
    @Inject(DOMAIN_REPOSITORY)
    private readonly domainRepository: IDomainRepository,
  ) {}

  async findAll(restaurantId: string) {
    return this.domainRepository.findAllByRestaurant(restaurantId);
  }

  async findById(id: string) {
    const item = await this.domainRepository.findById(id);
    if (!item) throw new NotFoundException('{Domain} not found');
    return item;
  }

  async create(dto: CreateDomainDto, restaurantId: string) {
    return this.domainRepository.create({ ...dto, restaurantId });
  }

  async update(id: string, dto: UpdateDomainDto) {
    await this.findById(id);
    return this.domainRepository.update(id, dto);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.domainRepository.delete(id);
  }
}
```

- NEVER import TypeORM or HTTP modules
- Use `import type` for DTOs and repository interface
- `findById` throws `NotFoundException` and is used as a guard in `update` and `delete`

### 7. Create Controller — `apps/api/src/{domain-plural}/{domain-plural}.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@featureboard/shared';
import type { CreateDomainDto, UpdateDomainDto } from '@featureboard/shared';
import { Roles, CurrentUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { DomainPluralService } from './{domain-plural}.service';

@Controller('{route-path}')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DomainPluralController {
  constructor(private readonly domainService: DomainPluralService) {}

  @Get()
  @Roles(UserRole.SERVER, UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
  async findAll(@CurrentUser() user: { restaurantId: string }) {
    return this.domainService.findAll(user.restaurantId);
  }

  @Get(':id')
  @Roles(UserRole.SERVER, UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.domainService.findById(id);
  }

  @Post()
  @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
  async create(
    @Body() dto: CreateDomainDto,
    @CurrentUser() user: { restaurantId: string },
  ) {
    return this.domainService.create(dto, user.restaurantId);
  }

  @Patch(':id')
  @Roles(UserRole.CHEF, UserRole.MANAGER, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateDomainDto) {
    return this.domainService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.domainService.delete(id);
  }
}
```

- Class-level `@UseGuards(AuthGuard('jwt'), RolesGuard)` on all protected controllers
- Read endpoints: all 4 roles; create/edit: Chef+Manager+Admin; delete: Manager+Admin
- Methods return service result directly (ResponseEnvelopeInterceptor wraps automatically)
- `@CurrentUser()` extracts `{ restaurantId }` from JWT

### 8. Create Module — `apps/api/src/{domain-plural}/{domain-plural}.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEntity } from './{domain-name}.entity';
import { DomainPluralService } from './{domain-plural}.service';
import { DomainPluralController } from './{domain-plural}.controller';
import { TypeOrmDomainRepository } from './typeorm-{domain-name}.repository';
import { DOMAIN_REPOSITORY } from './{domain-name}.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DomainEntity])],
  controllers: [DomainPluralController],
  providers: [
    DomainPluralService,
    { provide: DOMAIN_REPOSITORY, useClass: TypeOrmDomainRepository },
  ],
  exports: [DomainPluralService],
})
export class DomainPluralModule {}
```

### 9. Register in AppModule

Add the new module to `imports` in `apps/api/src/app.module.ts`.

### 10. Rebuild Shared Package

Run `pnpm --filter @featureboard/shared build` to compile the new types.
