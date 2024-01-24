import { Hub } from 'src/hub/entities/hub.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookStatus } from '../dto/book.dto';
import { BookedService } from './booked-entity';

@Entity({ name: 'book' })
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  customer_id: string;
  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ nullable: true })
  hub_id: string;
  @ManyToOne(() => Hub, (hub) => hub.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hub_id' })
  hub: Hub;

  @Column({ nullable: true })
  cancelled_reason: string;

  @Column({ type: 'timestamp' })
  booking_date: Date;

  @Column({ nullable: true })
  booking_address: string;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.bookingPlaced })
  book_status: BookStatus;

  @Column({ type: 'varchar', length: 6, select: false })
  book_otp: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sub_total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_after_discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'boolean', default: false })
  mark_as_received: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_after_tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grand_total: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    select: false,
  })
  serviceProvider_earning: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    select: false,
  })
  vendor_commission: number;

  @Column({ type: 'boolean', default: false, select: false })
  paid_to_serviceProvider: boolean;

  @OneToMany(() => BookedService, (bookedService) => bookedService.book, {
    cascade: true,
  })
  booked_services: BookedService[];
}
