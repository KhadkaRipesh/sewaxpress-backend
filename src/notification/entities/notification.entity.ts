import { Book } from 'src/book/entities/book.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  customer = 'CUSTOMER',
  serviceProvider = 'SERVICE_PROVIDER',
  BOOK = 'BOOK',
  message = 'MESSAGE',
  bargain = 'BARGAIN',
}

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ type: 'enum', enum: NotificationType })
  notification_type: NotificationType;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  user_id: string;
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  book_id: string;
  @ManyToOne(() => Book, (book) => book.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
