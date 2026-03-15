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

  // Seed feature items — Stoney River Steakhouse menu
  const featureRepo = dataSource.getRepository(FeatureItemEntity);
  const features = [
    // ── Appetizers ──
    {
      name: 'Deviled Eggs',
      categoryId: categoryMap['Appetizer'],
      description: 'Sugar cured bacon, homemade pickle relish',
      cost: 4.0,
      price: 14.0,
      allergens: 'eggs',
      tags: ['starter'],
    },
    {
      name: 'Spinach & Artichoke Dip',
      categoryId: categoryMap['Appetizer'],
      description: 'Reggiano cheese, warm tortilla chips',
      cost: 5.0,
      price: 17.0,
      allergens: 'dairy, gluten',
      tags: ['vegetarian', 'shareable'],
    },
    {
      name: 'Steak Egg Rolls',
      categoryId: categoryMap['Appetizer'],
      description: 'Spicy ranch, chimichurri',
      cost: 6.0,
      price: 19.0,
      allergens: 'gluten, soy',
      tags: ['beef', 'shareable'],
    },
    {
      name: 'Whiskey Shrimp on Country Toast',
      categoryId: categoryMap['Appetizer'],
      description: 'Dijon beurre blanc sauce',
      cost: 7.0,
      price: 18.0,
      allergens: 'shellfish, dairy, gluten',
      tags: ['seafood', 'starter'],
    },
    {
      name: 'Hot Chicken Biscuits',
      categoryId: categoryMap['Appetizer'],
      description: 'Our version of a Nashville favorite on a homemade Southern biscuit',
      cost: 5.0,
      price: 16.0,
      allergens: 'gluten, eggs',
      tags: ['chicken', 'southern'],
    },
    {
      name: 'Tuna Stack',
      categoryId: categoryMap['Appetizer'],
      description: 'Hawaiian ahi, avocado, roasted pineapple, Sriracha aioli, sesame wontons',
      cost: 8.0,
      price: 19.0,
      allergens: 'fish, soy, gluten, sesame',
      tags: ['seafood', 'raw'],
    },
    {
      name: 'Crab Cake',
      categoryId: categoryMap['Appetizer'],
      description: 'Pan seared, roasted pineapple salsa, Dijon mustard sauce',
      cost: 8.0,
      price: 19.0,
      allergens: 'shellfish, eggs, gluten',
      tags: ['seafood'],
    },

    // ── Soups ──
    {
      name: 'French Onion Soup',
      categoryId: categoryMap['Soup'],
      description: 'Caramelized onions, crouton, Gruyère',
      cost: 3.0,
      price: 11.0,
      allergens: 'dairy, gluten',
      tags: ['classic'],
    },
    {
      name: 'New England Lobster Bisque',
      categoryId: categoryMap['Soup'],
      description: 'Sherry garnish',
      cost: 5.0,
      price: 14.0,
      allergens: 'shellfish, dairy',
      tags: ['seafood', 'premium'],
    },

    // ── Salads ──
    {
      name: 'House Salad',
      categoryId: categoryMap['Salad'],
      description: 'Rustic croutons, hard boiled egg, cucumbers, bacon, tomatoes, cheddar',
      cost: 3.5,
      price: 14.0,
      allergens: 'eggs, dairy, gluten',
      tags: ['classic'],
    },
    {
      name: 'The Wedge',
      categoryId: categoryMap['Salad'],
      description: 'Iceberg, bacon, tomatoes, bleu cheese',
      cost: 3.5,
      price: 14.0,
      allergens: 'dairy',
      tags: ['classic'],
    },
    {
      name: 'Classic Caesar Salad',
      categoryId: categoryMap['Salad'],
      description: 'Parmesan cheese, rustic croutons',
      cost: 3.0,
      price: 14.0,
      allergens: 'dairy, gluten, eggs',
      tags: ['classic'],
    },
    {
      name: 'Steak Salad',
      categoryId: categoryMap['Salad'],
      description: 'Seared filet, avocado, bleu cheese, tomatoes, bacon, ranch, Dijon vinaigrette',
      cost: 10.0,
      price: 28.0,
      allergens: 'dairy',
      tags: ['beef', 'premium'],
    },
    {
      name: 'Cumberland Salad',
      categoryId: categoryMap['Salad'],
      description: 'Crispy chicken, roasted pecans, avocado, tomatoes, hickory-smoked bacon, buttermilk ranch',
      cost: 6.0,
      price: 20.0,
      allergens: 'tree nuts, dairy',
      tags: ['chicken', 'signature'],
    },

    // ── Steaks ──
    {
      name: 'Ribeye Steak',
      categoryId: categoryMap['Steak'],
      description: '14 oz., seasoned with our special blend, grilled in a 1600° Montague broiler',
      cost: 18.0,
      price: 51.0,
      tags: ['beef', 'signature'],
    },
    {
      name: 'New York Strip Steak',
      categoryId: categoryMap['Steak'],
      description: '16 oz., seasoned with our special blend, grilled in a 1600° Montague broiler',
      cost: 17.0,
      price: 50.0,
      tags: ['beef', 'signature'],
    },
    {
      name: 'Bone-In Cowboy Cut Ribeye',
      categoryId: categoryMap['Steak'],
      description: '22 oz., seasoned with our special blend, grilled in a 1600° Montague broiler',
      cost: 22.0,
      price: 58.0,
      tags: ['beef', 'premium', 'signature'],
    },
    {
      name: 'Prime Rib of Beef',
      categoryId: categoryMap['Steak'],
      description: '12 oz., aged and slow roasted, served with choice of side',
      cost: 15.0,
      price: 43.0,
      tags: ['beef', 'classic'],
    },
    {
      name: 'Steak Frites',
      categoryId: categoryMap['Steak'],
      description: 'Sliced hanger steak, sauce béarnaise, crispy shallots',
      cost: 12.0,
      price: 35.0,
      allergens: 'eggs, dairy, gluten',
      tags: ['beef'],
    },
    {
      name: 'Coffee-Cured Filet Mignon',
      categoryId: categoryMap['Steak'],
      description: '10 oz., cured in our signature blend',
      cost: 20.0,
      price: 54.0,
      tags: ['beef', 'signature', 'premium'],
    },
    {
      name: 'Center Cut Filet Mignon',
      categoryId: categoryMap['Steak'],
      description: '10 oz., served with choice of side',
      cost: 19.0,
      price: 54.0,
      tags: ['beef', 'classic'],
    },
    {
      name: 'Filet Medallions & Crab Cake',
      categoryId: categoryMap['Steak'],
      description: 'Filet medallions, pan seared crab cake, Dijon mustard sauce',
      cost: 18.0,
      price: 46.0,
      allergens: 'shellfish, eggs',
      tags: ['beef', 'seafood', 'surf and turf'],
    },

    // ── Seafood ──
    {
      name: 'Shrimp & Grits',
      categoryId: categoryMap['Seafood'],
      description: 'Jumbo shrimp, bacon, Worcestershire cream reduction, cheese grits',
      cost: 9.0,
      price: 29.0,
      allergens: 'shellfish, dairy',
      tags: ['southern', 'signature'],
    },
    {
      name: 'NOLA Grilled Shrimp',
      categoryId: categoryMap['Seafood'],
      description: 'Blackened shrimp, roasted pineapple salsa, Southern rice, seasonal vegetable',
      cost: 10.0,
      price: 30.0,
      allergens: 'shellfish',
      tags: ['southern'],
    },
    {
      name: 'Sesame Crusted Ahi Tuna',
      categoryId: categoryMap['Seafood'],
      description: 'Sriracha aioli, soy ginger sherry sauce, sushi rice, baby bok choy',
      cost: 14.0,
      price: 35.0,
      allergens: 'fish, soy, sesame',
      tags: ['asian-inspired', 'raw'],
    },
    {
      name: 'Hong Kong Sea Bass',
      categoryId: categoryMap['Seafood'],
      description: 'Grilled, baby bok choy, sushi rice, soy sherry reduction',
      cost: 18.0,
      price: 46.0,
      allergens: 'fish, soy',
      tags: ['asian-inspired', 'premium'],
    },
    {
      name: 'Cedar Plank Salmon',
      categoryId: categoryMap['Seafood'],
      description: 'Oven roasted, lemon Dijon butter, garlic whipped potatoes, broccoli (available simply grilled)',
      cost: 12.0,
      price: 34.0,
      allergens: 'fish, dairy',
      tags: ['healthy'],
    },
    {
      name: 'Pecan Encrusted Trout',
      categoryId: categoryMap['Seafood'],
      description: 'Dijon mustard sauce, broccoli, garlic whipped potatoes',
      cost: 10.0,
      price: 30.0,
      allergens: 'fish, tree nuts, dairy',
      tags: ['southern'],
    },
    {
      name: 'Shrimp Scampi Pasta',
      categoryId: categoryMap['Seafood'],
      description: 'Jumbo shrimp, garlic cream sauce, spinach, tomatoes',
      cost: 9.0,
      price: 29.0,
      allergens: 'shellfish, dairy, gluten',
      tags: ['pasta'],
    },

    // ── Entrées ──
    {
      name: 'Tuscan Chicken',
      categoryId: categoryMap['Entrée'],
      description: 'Sautéed, goat cheese, sundried tomatoes, beurre blanc, garlic whipped potatoes, broccoli',
      cost: 8.0,
      price: 28.0,
      allergens: 'dairy',
      tags: ['chicken'],
    },
    {
      name: 'Bistro Chicken',
      categoryId: categoryMap['Entrée'],
      description: 'Panko crusted, parmesan cheese, lemon caper sauce, garlic whipped potatoes, broccoli',
      cost: 8.0,
      price: 28.0,
      allergens: 'dairy, gluten, eggs',
      tags: ['chicken'],
    },
    {
      name: 'BBQ Danish Baby Back Ribs',
      categoryId: categoryMap['Entrée'],
      description: 'BBQ sauce, parmesan fries, Southern slaw',
      cost: 11.0,
      price: 33.0,
      tags: ['pork', 'bbq', 'signature'],
    },
    {
      name: 'Wild Mushroom Meatloaf',
      categoryId: categoryMap['Entrée'],
      description: 'Madeira sauce, garlic whipped potatoes, broccoli',
      cost: 7.0,
      price: 27.0,
      allergens: 'gluten, eggs',
      tags: ['comfort'],
    },
    {
      name: 'Bay Street Chicken Fingers',
      categoryId: categoryMap['Entrée'],
      description: '"Old Savannah" style, parmesan fries, Southern slaw',
      cost: 7.0,
      price: 26.0,
      allergens: 'gluten, eggs',
      tags: ['chicken', 'southern'],
    },
    {
      name: 'Lollipop Lamb Chops',
      categoryId: categoryMap['Entrée'],
      description: 'Rosemary, balsamic vinegar, lemon, chimichurri, garlic whipped potatoes',
      cost: 18.0,
      price: 47.0,
      tags: ['lamb', 'premium'],
    },

    // ── Desserts ──
    {
      name: 'Chocolate Lava Cake',
      categoryId: categoryMap['Dessert'],
      description: 'Warm chocolate cake with vanilla bean ice cream',
      cost: 4.0,
      price: 14.0,
      allergens: 'dairy, eggs, gluten',
      tags: ['chocolate', 'signature'],
    },
    {
      name: 'New York Cheesecake',
      categoryId: categoryMap['Dessert'],
      description: 'Classic creamy cheesecake with berry compote',
      cost: 3.5,
      price: 13.0,
      allergens: 'dairy, eggs, gluten',
      tags: ['classic'],
    },
    {
      name: 'Crème Brûlée',
      categoryId: categoryMap['Dessert'],
      description: 'Vanilla bean custard, caramelized sugar crust',
      cost: 3.0,
      price: 12.0,
      allergens: 'dairy, eggs',
      tags: ['classic', 'french'],
    },

    // ── Wines ──
    {
      name: 'Chalk Hill Chardonnay',
      categoryId: categoryMap['Wine'],
      description: 'Russian River Valley — rich, layered, with stone fruit and toasted oak',
      cost: 5.0,
      price: 13.0,
      tags: ['white', 'california', 'by-the-glass'],
    },
    {
      name: 'Miraval Rosé',
      categoryId: categoryMap['Wine'],
      description: 'Côtes de Provence, France — dry, elegant, with fresh citrus and mineral notes',
      cost: 6.0,
      price: 14.0,
      tags: ['rosé', 'france', 'by-the-glass'],
    },
    {
      name: 'Daou Cabernet Sauvignon',
      categoryId: categoryMap['Wine'],
      description: 'Paso Robles — bold dark fruit, chocolate, well-integrated tannins',
      cost: 5.0,
      price: 14.0,
      tags: ['red', 'california', 'by-the-glass'],
    },
    {
      name: 'Böen Pinot Noir',
      categoryId: categoryMap['Wine'],
      description: 'California — silky red fruit, earthy undertones, balanced acidity',
      cost: 5.0,
      price: 14.0,
      tags: ['red', 'california', 'by-the-glass'],
    },
    {
      name: 'The Prisoner Red Blend',
      categoryId: categoryMap['Wine'],
      description: 'California — bold Zinfandel blend with dark fruit, spice, and vanilla',
      cost: 6.0,
      price: 16.0,
      tags: ['red', 'california', 'by-the-glass'],
    },
    {
      name: 'Honig Sauvignon Blanc',
      categoryId: categoryMap['Wine'],
      description: 'Napa Valley — bright citrus, melon, and mineral finish',
      cost: 20.0,
      price: 50.0,
      tags: ['white', 'california', 'bottle'],
    },
    {
      name: 'Etude Pinot Noir',
      categoryId: categoryMap['Wine'],
      description: 'Grace Benoist Ranch, Carneros — earthy cherry, mushroom, silky tannins',
      cost: 25.0,
      price: 62.0,
      tags: ['red', 'california', 'bottle'],
    },
    {
      name: 'Austin Hope Cabernet Sauvignon',
      categoryId: categoryMap['Wine'],
      description: 'Paso Robles — dense blackberry, dark chocolate, velvety finish',
      cost: 35.0,
      price: 90.0,
      tags: ['red', 'california', 'bottle'],
    },
    {
      name: 'Rombauer Chardonnay',
      categoryId: categoryMap['Wine'],
      description: 'Carneros — lush tropical fruit, buttery oak, creamy mouthfeel',
      cost: 40.0,
      price: 95.0,
      tags: ['white', 'california', 'bottle'],
    },
    {
      name: 'Jordan Cabernet Sauvignon',
      categoryId: categoryMap['Wine'],
      description: 'Alexander Valley — elegant dark cherry, cassis, structured tannins',
      cost: 42.0,
      price: 98.0,
      tags: ['red', 'california', 'bottle'],
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

  // Seed scheduled features for this week — rotating nightly specials
  const scheduleRepo = dataSource.getRepository(ScheduledFeatureEntity);
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const weekSchedule = [
    // Monday — comfort classics
    { day: 0, features: ['French Onion Soup', 'Prime Rib of Beef', 'Tuscan Chicken', 'Cedar Plank Salmon', 'Chocolate Lava Cake'] },
    // Tuesday — steakhouse spotlight
    { day: 1, features: ['New England Lobster Bisque', 'Ribeye Steak', 'Steak Frites', 'Shrimp & Grits', 'Crème Brûlée'] },
    // Wednesday — surf & turf
    { day: 2, features: ['Crab Cake', 'Filet Medallions & Crab Cake', 'Hong Kong Sea Bass', 'Lollipop Lamb Chops', 'New York Cheesecake'] },
    // Thursday — chef's favorites
    { day: 3, features: ['Tuna Stack', 'Coffee-Cured Filet Mignon', 'Sesame Crusted Ahi Tuna', 'BBQ Danish Baby Back Ribs', 'Chocolate Lava Cake'] },
    // Friday — premium night
    { day: 4, features: ['Whiskey Shrimp on Country Toast', 'Bone-In Cowboy Cut Ribeye', 'Hong Kong Sea Bass', 'Pecan Encrusted Trout', 'Crème Brûlée'] },
    // Saturday — signature selections
    { day: 5, features: ['Deviled Eggs', 'Steak Egg Rolls', 'New York Strip Steak', 'NOLA Grilled Shrimp', 'Lollipop Lamb Chops', 'Chocolate Lava Cake'] },
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
    { food: 'Ribeye Steak', wine: 'Daou Cabernet Sauvignon', note: 'Bold dark fruit and velvety tannins stand up to the richly marbled ribeye' },
    { food: 'Cedar Plank Salmon', wine: 'Honig Sauvignon Blanc', note: 'Bright citrus and mineral notes complement the smoky, roasted salmon' },
    { food: 'Sesame Crusted Ahi Tuna', wine: 'Böen Pinot Noir', note: 'Silky red fruit pairs beautifully with seared rare tuna and soy ginger sauce' },
    { food: 'Tuscan Chicken', wine: 'Chalk Hill Chardonnay', note: 'Rich stone fruit and toasted oak echo the goat cheese and beurre blanc' },
    { food: 'Lollipop Lamb Chops', wine: 'Etude Pinot Noir', note: 'Earthy Carneros Pinot balances rosemary, balsamic, and chimichurri' },
    { food: 'Filet Medallions & Crab Cake', wine: 'Miraval Rosé', note: 'Dry Provençal rosé bridges the rich filet and delicate crab cake' },
    { food: 'Steak Frites', wine: 'The Prisoner Red Blend', note: 'A bold, spicy Zinfandel blend to match the béarnaise and charred hanger steak' },
    { food: 'Hong Kong Sea Bass', wine: 'Rombauer Chardonnay', note: 'Lush, buttery Chardonnay complements the soy sherry glaze and delicate bass' },
    { food: 'Bone-In Cowboy Cut Ribeye', wine: 'Jordan Cabernet Sauvignon', note: 'Structured tannins and dark cherry fruit match this massive, flavorful cut' },
    { food: 'BBQ Danish Baby Back Ribs', wine: 'Austin Hope Cabernet Sauvignon', note: 'Dense blackberry and dark chocolate pair with smoky, sweet BBQ sauce' },
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
