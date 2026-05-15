import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Risk } from './entities/risk.entity';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Risk]),
    UserModule,
    LocationModule,
    AuditModule,
  ],
  providers: [RiskService],
  controllers: [RiskController],
  exports: [TypeOrmModule],
})
export class RiskModule {}
