import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Audit]),
    UserModule,
    LocationModule,
  ],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [TypeOrmModule],
})
export class AuditModule {}