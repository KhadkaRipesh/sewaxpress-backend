import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Hub } from './hub.entity';
import { User } from 'src/users/entities/user.entity';

export enum HubRating {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
}
@Entity('hub_review')
export class HubReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  // ---------- RELATIONS ----------

  @Column()
  hub_id: string;
  @ManyToOne(() => Hub, (hub) => hub.hub_reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hub_id' })
  hub: Hub;

  @Column()
  user_id: string;
  @ManyToOne(() => User, (user) => user.hub_reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
