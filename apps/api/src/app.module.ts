import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { FeaturesModule } from './features/features.module';
import { ScheduleModule } from './schedule/schedule.module';
import { PairingsModule } from './pairings/pairings.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { RestaurantEntity } from './database/restaurant.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'featureboard'),
        password: config.get<string>('DB_PASSWORD', 'featureboard'),
        database: config.get<string>('DB_NAME', 'featureboard'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([RestaurantEntity]),
    AuthModule,
    FeaturesModule,
    ScheduleModule,
    PairingsModule,
    UsersModule,
    CategoriesModule,
  ],
})
export class AppModule {}
