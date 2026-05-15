import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: { name: string; description?: string; parentId?: number }) {
    const location = new Location();
    location.name = createLocationDto.name;
    if (createLocationDto.description) location.description = createLocationDto.description;

    if (createLocationDto.parentId) {
      const parent = await this.locationRepository.findOne({ where: { id: createLocationDto.parentId } });
      if (!parent) throw new NotFoundException('Parent location not found');
      location.parent = parent;
    }

    return this.locationRepository.save(location);
  }

  async findAll() {
    return this.locationRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async update(id: number, updateData: { name?: string; description?: string; parentId?: number }) {
    const location = await this.findOne(id);

    if (updateData.name) location.name = updateData.name;
    if (updateData.description !== undefined) location.description = updateData.description;
    if (updateData.parentId !== undefined) {
      if (updateData.parentId) {
        const parent = await this.locationRepository.findOne({ where: { id: updateData.parentId } });
        if (!parent) throw new NotFoundException('Parent location not found');
        location.parent = parent;
      } else {
        location.parent = null as any;
      }
    }

    return this.locationRepository.save(location);
  }

  async delete(id: number) {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
    return { message: 'Location deleted successfully' };
  }

  async getTree() {
    const allLocations = await this.locationRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });

    const buildTree = (locations: Location[], parentId: number | null): any[] => {
      return locations
        .filter((loc) => (parentId === null ? !loc.parent : loc.parent?.id === parentId))
        .map((loc) => ({
          ...loc,
          children: buildTree(allLocations, loc.id),
        }));
    };

    return buildTree(allLocations, null);
  }
}