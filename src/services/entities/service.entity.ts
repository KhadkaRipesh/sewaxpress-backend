import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Hub } from 'src/hub/entities/hub.entity';
import { CartService } from 'src/cart/entities/cart-service.entity';
import { BookedService } from 'src/book/entities/booked-entity';

@Entity({ name: 'services' })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  image: string;

  @Column({ type: 'text', nullable: true })
  estimated_time: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  //  --------------------Realtions---------------------
  @Column()
  category_id: string;
  @ManyToOne(() => Category, (category) => category.service, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  hub_id: string;
  @ManyToOne(() => Hub, (hub) => hub.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hub_id' })
  hub: Hub;

  // I may add order item,, discount item

  @OneToMany(() => CartService, (cartService) => cartService.service, {
    cascade: true,
  })
  cart_services: CartService[];

  @OneToMany(() => BookedService, (bookedService) => bookedService.service, {
    cascade: true,
  })
  booked_services: BookedService[];
}
