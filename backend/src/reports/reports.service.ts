import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk } from '../risk/entities/risk.entity';
import { Audit } from '../audit/entities/audit.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Risk)
    private riskRepository: Repository<Risk>,
    @InjectRepository(Audit)
    private auditRepository: Repository<Audit>,
  ) {}

  async generateRiskReport(filters?: { status?: string; locationId?: number }) {
    const query = this.riskRepository.createQueryBuilder('risk')
      .leftJoinAndSelect('risk.location', 'location')
      .leftJoinAndSelect('risk.assignee', 'assignee')
      .leftJoinAndSelect('risk.creator', 'creator');

    if (filters?.status) {
      query.andWhere('risk.status = :status', { status: filters.status });
    }
    if (filters?.locationId) {
      query.andWhere('risk.location_id = :locationId', { locationId: filters.locationId });
    }

    return query.getMany();
  }

  async generateAuditReport(filters?: { status?: string; locationId?: number }) {
    const query = this.auditRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.location', 'location')
      .leftJoinAndSelect('audit.auditor', 'auditor');

    if (filters?.status) {
      query.andWhere('audit.status = :status', { status: filters.status });
    }
    if (filters?.locationId) {
      query.andWhere('audit.location_id = :locationId', { locationId: filters.locationId });
    }

    return query.getMany();
  }

  getStatistics() {
    return this.riskRepository.createQueryBuilder('risk')
      .select('risk.status, COUNT(risk.id) as count')
      .groupBy('risk.status')
      .getRawMany();
  }
}