import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Risk } from '../risk/entities/risk.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { RiskModule } from '../risk/risk.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Risk, User, Location]),
    RiskModule,
    UserModule,
    LocationModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
