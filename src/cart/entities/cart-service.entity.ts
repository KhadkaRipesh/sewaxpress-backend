import { Service } from 'src/services/entities/service.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './cart.entity';

@Entity({ name: 'cart_services' })
export class CartService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  service_id: string;
  @ManyToOne(() => Service, (service) => service.cart_services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'varchar', length: 255 })
  note: string;

  @Column()
  cart_id: string;
  @ManyToOne(() => Service, (service) => service.cart_services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;
  //   @Column({ type: 'timestamp' })
  //   bookiing_date: Date;

  //   @ApiProperty({ example: '2023-07-20' })
  //   @IsDateString()
  //   submission_deadline: Date;
}
