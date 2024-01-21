import { Hub } from 'src/hub/entities/hub.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookStatus } from '../dto/book.dto';

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

  @Column({ type: 'timestamp' })
  booking_date: Date;

  @Column({ nullable: true })
  booking_address: string;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.bookingPlaced })
  book_status: BookStatus;

  @Column({ type: 'varchar', length: 5, select: false })
  book_otp: string;
}
