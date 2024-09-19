import { Service } from 'src/services/entities/service.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Book } from './book.entity';

@Entity({ name: 'booked_service' })
export class BookedService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  service_id: string;
  @ManyToOne(() => Service, (item) => item.booked_services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ default: '', type: 'varchar', length: 255 })
  note: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  booked_id: string;
  @ManyToOne(() => Book, (book) => book.booked_services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booked_id' })
  book: Book;
}
