import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private auditRepository: Repository<Audit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async create(createAuditDto: {
    title: string;
    description: string;
    auditorId: number;
    locationId?: number;
    status?: string;
  }) {
    const audit = new Audit();
    audit.title = createAuditDto.title;
    audit.description = createAuditDto.description;
    audit.status = createAuditDto.status || 'draft';

    const auditor = await this.userRepository.findOne({ where: { id: createAuditDto.auditorId } });
    if (!auditor) throw new NotFoundException('Auditor not found');
    audit.auditor = auditor;

    if (createAuditDto.locationId) {
      const location = await this.locationRepository.findOne({ where: { id: createAuditDto.locationId } });
      if (location) audit.location = location;
    }

    return this.auditRepository.save(audit);
  }

  async findAll(filters?: { status?: string; auditorId?: number; locationId?: number }) {
    const query = this.auditRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.auditor', 'auditor')
      .leftJoinAndSelect('audit.location', 'location');

    if (filters?.status) {
      query.andWhere('audit.status = :status', { status: filters.status });
    }
    if (filters?.auditorId) {
      query.andWhere('audit.auditor_id = :auditorId', { auditorId: filters.auditorId });
    }
    if (filters?.locationId) {
      query.andWhere('audit.location_id = :locationId', { locationId: filters.locationId });
    }

    return query.orderBy('audit.createdAt', 'DESC').getMany();
  }

  async findOne(id: number) {
    const audit = await this.auditRepository.findOne({
      where: { id },
      relations: ['auditor', 'location'],
    });
    if (!audit) throw new NotFoundException('Audit not found');
    return audit;
  }

  async update(id: number, updateData: {
    title?: string;
    description?: string;
    status?: string;
    auditorId?: number;
    locationId?: number;
  }) {
    const audit = await this.findOne(id);

    if (updateData.title) audit.title = updateData.title;
    if (updateData.description) audit.description = updateData.description;
    if (updateData.status) audit.status = updateData.status;
    if (updateData.auditorId) {
      const auditor = await this.userRepository.findOne({ where: { id: updateData.auditorId } });
      if (auditor) audit.auditor = auditor;
    }
    if (updateData.locationId !== undefined) {
      if (updateData.locationId) {
        const location = await this.locationRepository.findOne({ where: { id: updateData.locationId } });
        if (location) audit.location = location;
      } else {
        audit.location = null as any;
      }
    }

    return this.auditRepository.save(audit);
  }

  async delete(id: number) {
    const audit = await this.findOne(id);
    await this.auditRepository.remove(audit);
    return { message: 'Audit deleted successfully' };
  }
}