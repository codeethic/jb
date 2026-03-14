import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PairingEntity } from './pairing.entity';
import { PairingsService } from './pairings.service';
import { PairingsController } from './pairings.controller';
import { TypeOrmPairingRepository } from './typeorm-pairing.repository';
import { PAIRING_REPOSITORY } from './pairing.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PairingEntity])],
  controllers: [PairingsController],
  providers: [
    PairingsService,
    { provide: PAIRING_REPOSITORY, useClass: TypeOrmPairingRepository },
  ],
  exports: [PairingsService],
})
export class PairingsModule {}
