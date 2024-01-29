import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationDeviceType } from '../dto/firebase.dto';

@Entity({ name: 'firebase_token' })
export class FirebaseToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;
  @ManyToOne(() => User, (user) => user.firebase_tokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: NotificationDeviceType })
  device_type: NotificationDeviceType;

  @Column()
  notification_token: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
