import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk, RiskStatus } from './entities/risk.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class RiskService {
  constructor(
    @InjectRepository(Risk)
    private riskRepository: Repository<Risk>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async create(createRiskDto: {
    title: string;
    description: string;
    locationId?: number;
    assigneeId?: number;
    creatorId: number;
    auditId?: number;
  }) {
    const risk = new Risk();
    risk.title = createRiskDto.title;
    risk.description = createRiskDto.description;
    
    const creator = await this.userRepository.findOne({ where: { id: createRiskDto.creatorId } });
    if (!creator) throw new NotFoundException('Creator not found');
    risk.creator = creator;
    risk.status = RiskStatus.OPEN;

    if (createRiskDto.locationId) {
      const location = await this.locationRepository.findOne({ where: { id: createRiskDto.locationId } });
      if (location) risk.location = location;
    }
    if (createRiskDto.assigneeId) {
      const assignee = await this.userRepository.findOne({ where: { id: createRiskDto.assigneeId } });
      if (assignee) {
        risk.assignee = assignee;
        risk.status = RiskStatus.ASSIGNED;
      }
    }

    return this.riskRepository.save(risk);
  }

  async findAll(filters?: { status?: RiskStatus; assigneeId?: number; locationId?: number }) {
    const query = this.riskRepository.createQueryBuilder('risk')
      .leftJoinAndSelect('risk.assignee', 'assignee')
      .leftJoinAndSelect('risk.location', 'location')
      .leftJoinAndSelect('risk.creator', 'creator');

    if (filters?.status) {
      query.andWhere('risk.status = :status', { status: filters.status });
    }
    if (filters?.assigneeId) {
      query.andWhere('risk.assignee_id = :assigneeId', { assigneeId: filters.assigneeId });
    }
    if (filters?.locationId) {
      query.andWhere('risk.location_id = :locationId', { locationId: filters.locationId });
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const risk = await this.riskRepository.findOne({
      where: { id },
      relations: ['assignee', 'location', 'creator', 'audit'],
    });
    if (!risk) throw new NotFoundException('Risk not found');
    return risk;
  }

  async updateStatus(id: number, status: RiskStatus) {
    const risk = await this.findOne(id);
    risk.status = status;
    return this.riskRepository.save(risk);
  }

  async addEvidence(id: number, evidenceUrls: string[]) {
    const risk = await this.findOne(id);
    risk.evidenceUrls = [...(risk.evidenceUrls || []), ...evidenceUrls];
    return this.riskRepository.save(risk);
  }

  async update(id: number, updateData: {
    title?: string;
    description?: string;
    locationId?: number;
    assigneeId?: number;
    status?: RiskStatus;
  }) {
    const risk = await this.findOne(id);

    if (updateData.title) risk.title = updateData.title;
    if (updateData.description) risk.description = updateData.description;
    if (updateData.status) risk.status = updateData.status;
    if (updateData.locationId !== undefined) {
      if (updateData.locationId) {
        const location = await this.locationRepository.findOne({ where: { id: updateData.locationId } });
        if (location) risk.location = location;
      } else {
        risk.location = null as any;
      }
    }
    if (updateData.assigneeId !== undefined) {
      if (updateData.assigneeId) {
        const assignee = await this.userRepository.findOne({ where: { id: updateData.assigneeId } });
        if (assignee) risk.assignee = assignee;
      } else {
        risk.assignee = null as any;
      }
    }

    return this.riskRepository.save(risk);
  }

  async delete(id: number) {
    const risk = await this.findOne(id);
    await this.riskRepository.remove(risk);
    return { message: 'Risk deleted successfully' };
  }
}
