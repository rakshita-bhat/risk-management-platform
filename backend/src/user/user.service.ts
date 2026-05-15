import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateData: { firstName?: string; lastName?: string; role?: string }) {
    const user = await this.findOne(id);
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.role) user.role = updateData.role as any;
    return this.userRepository.save(user);
  }

  async delete(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async create(data: { email: string; password: string; firstName: string; lastName: string; role?: UserRole }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.USER,
    });
    return this.userRepository.save(user);
  }
}