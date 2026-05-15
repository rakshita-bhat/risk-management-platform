import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Location } from '../../location/entities/location.entity';
import { Audit } from '../../audit/entities/audit.entity';

export enum RiskStatus {
  OPEN = 'Open',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  APPROVED = 'Approved',
  CLOSED = 'Closed',
}

@Entity('risks')
export class Risk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => Audit, { nullable: true })
  @JoinColumn({ name: 'audit_id' })
  audit: Audit;

  @Column({
    type: 'enum',
    enum: RiskStatus,
    default: RiskStatus.OPEN,
  })
  status: RiskStatus;

  @Column('simple-array', { nullable: true })
  evidenceUrls: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
