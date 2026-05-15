import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk, RiskStatus } from '../risk/entities/risk.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Risk)
    private riskRepository: Repository<Risk>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async getDashboardData() {
    const totalRisks = await this.riskRepository.count();

    const risksByStatus = await this.riskRepository
      .createQueryBuilder('risk')
      .select('risk.status, COUNT(risk.id) as count')
      .groupBy('risk.status')
      .getRawMany();

    const risksByAssignee = await this.riskRepository
      .createQueryBuilder('risk')
      .leftJoin('risk.assignee', 'assignee')
      .select('assignee.id, assignee.firstName, assignee.lastName, COUNT(risk.id) as count')
      .groupBy('assignee.id')
      .getRawMany();

    const risksByLocation = await this.riskRepository
      .createQueryBuilder('risk')
      .leftJoin('risk.location', 'location')
      .select('location.id, location.name, COUNT(risk.id) as count')
      .groupBy('location.id')
      .getRawMany();

    return {
      totalRisks,
      risksByStatus,
      risksByAssignee,
      risksByLocation,
    };
  }
}
