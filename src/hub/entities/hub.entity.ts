import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HubStatus } from '../dto/hub.dto';
import { THubTiming } from 'src/@types/hub.t';
import { User } from 'src/users/entities/user.entity';
import { HubReview } from './hub-review.entity';
import { Service } from 'src/services/entities/service.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Book } from 'src/book/entities/book.entity';

@Entity({ name: 'hub' })
export class Hub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone_number: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  avatar: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  abn_acn_number: string;

  @Column({ type: 'enum', enum: HubStatus, default: HubStatus.PENDING })
  status: HubStatus;

  @Column({ type: 'boolean', default: false })
  is_online: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'text', array: true, default: [] })
  documents: string[];

  @Column({ type: 'jsonb', default: {} })
  opening_hours: THubTiming;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  //   ---------RELATIONS-----------

  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.hub, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  //   may be i should add delevery config too

  @OneToMany(() => HubReview, (hub_review) => hub_review.hub, {
    cascade: true,
  })
  hub_reviews: HubReview[];

  @OneToMany(() => Service, (service) => service.hub, {
    cascade: true,
  })
  services: Service[];

  @OneToMany(() => Cart, (cart) => cart.hub, { cascade: true })
  carts: Cart[];

  @OneToMany(() => Book, (book) => book.hub, { cascade: true })
  bookings: Book[];
}
