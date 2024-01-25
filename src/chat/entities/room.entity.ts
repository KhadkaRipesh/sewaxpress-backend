import { Hub } from 'src/hub/entities/hub.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';

@Entity({ name: 'room' })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  //   REALTIONS-------------

  @OneToMany(() => Chat, (chat) => chat.room, { cascade: true })
  chats: Chat[];

  @Column()
  customer_id: string;
  @ManyToOne(() => User, (user) => user.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column()
  hub_id: string;
  @ManyToOne(() => Hub, (hub) => hub.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hub_id' })
  hub: Hub;
}
