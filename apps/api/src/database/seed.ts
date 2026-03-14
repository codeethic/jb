import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { UserRole, MealPeriod, FeatureStatus, DEFAULT_CATEGORIES } from '@featureboard/shared';
import { UserEntity } from '../users/user.entity';
import { CategoryEntity } from '../categories/category.entity';
import { FeatureItemEntity } from '../features/feature-item.entity';
import { ScheduledFeatureEntity } from '../schedule/scheduled-feature.entity';
import { PairingEntity } from '../pairings/pairing.entity';
import { RestaurantEntity } from './restaurant.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'featureboard',
    password: process.env.DB_PASSWORD || 'featureboard',
    database: process.env.DB_NAME || 'featureboard',
    entities: [RestaurantEntity, UserEntity, CategoryEntity, FeatureItemEntity, ScheduledFeatureEntity, PairingEntity],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected to database. Seeding...');

  const restaurantRepo = dataSource.getRepository(RestaurantEntity);
  let restaurant = await restaurantRepo.findOne({ where: { name: 'Demo Restaurant' } });
  if (!restaurant) {
    restaurant = await restaurantRepo.save(restaurantRepo.create({ name: 'Demo Restaurant' }));
  }
  const restaurantId = restaurant.id;

  // Seed users (one per role)
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = [
    { email: 'admin@demo.com', name: 'Admin User', role: UserRole.ADMIN },
    { email: 'manager@demo.com', name: 'Manager User', role: UserRole.MANAGER },
    { email: 'chef@demo.com', name: 'Chef User', role: UserRole.CHEF },
    { email: 'server@demo.com', name: 'Server User', role: UserRole.SERVER },
  ];

  const userRepo = dataSource.getRepository(UserEntity);
  for (const u of users) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      await userRepo.save(userRepo.create({ ...u, passwordHash, restaurantId }));
    }
  }
  console.log('Users seeded.');

  // Seed categories
  const categoryRepo = dataSource.getRepository(CategoryEntity);
  const categoryMap: Record<string, string> = {};
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const name = DEFAULT_CATEGORIES[i];
    let cat = await categoryRepo.findOne({ where: { name, restaurantId } });
    if (!cat) {
      cat = await categoryRepo.save(categoryRepo.create({ name, sortOrder: i, restaurantId }));
    }
    categoryMap[name] = cat.id;
  }
  console.log('Categories seeded.');

  // Seed feature items
  const featureRepo = dataSource.getRepository(FeatureItemEntity);
  const features = [
    {
      name: 'Crab Cakes',
      categoryId: categoryMap['Appetizer'],
      description: 'Pan-seared lump crab with lemon aioli',
      cost: 8.5,
      price: 18.0,
      allergens: 'shellfish, eggs',
      tags: ['seafood'],
    },
    {
      name: 'French Onion Soup',
      categoryId: categoryMap['Soup'],
      description: 'Classic French onion with gruyère crouton',
      cost: 3.0,
      price: 12.0,
      allergens: 'dairy, gluten',
      tags: ['comfort'],
    },
    {
      name: 'Grilled Halibut',
      categoryId: categoryMap['Fish'],
      description: 'Pacific halibut with beurre blanc and seasonal vegetables',
      cost: 14.0,
      price: 36.0,
      allergens: 'fish, dairy',
      tags: ['seafood', 'seasonal'],
    },
    {
      name: 'Braised Short Rib',
      categoryId: categoryMap['Entrée'],
      description: 'Slow-braised beef short rib with red wine jus',
      cost: 12.0,
      price: 34.0,
      tags: ['comfort', 'beef'],
    },
    {
      name: 'Chocolate Lava Cake',
      categoryId: categoryMap['Dessert'],
      description: 'Warm chocolate cake with vanilla ice cream',
      cost: 4.0,
      price: 14.0,
      allergens: 'dairy, eggs, gluten',
      tags: ['chocolate'],
    },
    {
      name: 'Sauvignon Blanc',
      categoryId: categoryMap['Wine'],
      description: 'Cloudy Bay, Marlborough 2023',
      cost: 8.0,
      price: 16.0,
      tags: ['white', 'new zealand'],
    },
    {
      name: 'Pinot Noir',
      categoryId: categoryMap['Wine'],
      description: 'Domaine Drouhin, Willamette Valley 2022',
      cost: 12.0,
      price: 22.0,
      tags: ['red', 'oregon'],
    },
  ];

  const featureIds: Record<string, string> = {};
  for (const f of features) {
    let item = await featureRepo.findOne({ where: { name: f.name, restaurantId } });
    if (!item) {
      item = await featureRepo.save(
        featureRepo.create({ ...f, tags: f.tags || [], active: true, restaurantId }),
      );
    }
    featureIds[f.name] = item.id;
  }
  console.log('Feature items seeded.');

  // Seed scheduled features for this week
  const scheduleRepo = dataSource.getRepository(ScheduledFeatureEntity);
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const weekSchedule = [
    { day: 0, features: ['Crab Cakes', 'Grilled Halibut', 'Chocolate Lava Cake'] },
    { day: 1, features: ['French Onion Soup', 'Braised Short Rib', 'Chocolate Lava Cake'] },
    { day: 2, features: ['Crab Cakes', 'Braised Short Rib'] },
    { day: 3, features: ['French Onion Soup', 'Grilled Halibut'] },
    { day: 4, features: ['Crab Cakes', 'Grilled Halibut', 'Braised Short Rib', 'Chocolate Lava Cake'] },
  ];

  for (const ws of weekSchedule) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + ws.day);
    const dateStr = date.toISOString().split('T')[0];

    for (let i = 0; i < ws.features.length; i++) {
      const featureName = ws.features[i];
      const exists = await scheduleRepo.findOne({
        where: { featureItemId: featureIds[featureName], serviceDate: dateStr, restaurantId },
      });
      if (!exists) {
        await scheduleRepo.save(
          scheduleRepo.create({
            featureItemId: featureIds[featureName],
            serviceDate: dateStr,
            mealPeriod: MealPeriod.DINNER,
            status: FeatureStatus.PUBLISHED,
            sortOrder: i,
            restaurantId,
          }),
        );
      }
    }
  }
  console.log('Schedule seeded.');

  // Seed pairings
  const pairingRepo = dataSource.getRepository(PairingEntity);
  const pairings = [
    { food: 'Grilled Halibut', wine: 'Sauvignon Blanc', note: 'Crisp acidity complements the fish' },
    { food: 'Braised Short Rib', wine: 'Pinot Noir', note: 'Earthy tones pair with rich beef' },
  ];

  for (const p of pairings) {
    const exists = await pairingRepo.findOne({
      where: { foodItemId: featureIds[p.food], wineItemId: featureIds[p.wine], restaurantId },
    });
    if (!exists) {
      await pairingRepo.save(
        pairingRepo.create({
          foodItemId: featureIds[p.food],
          wineItemId: featureIds[p.wine],
          pairingNote: p.note,
          restaurantId,
        }),
      );
    }
  }
  console.log('Pairings seeded.');

  await dataSource.destroy();
  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
