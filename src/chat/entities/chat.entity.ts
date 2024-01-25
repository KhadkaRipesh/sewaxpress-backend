import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'chats' })
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @CreateDateColumn()
  created_at: Date;

  //   RELATIONS-------------------

  @Column()
  room_id: string;
  @ManyToOne(() => Room, (room) => room.chats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column()
  sender_id: string;
  @ManyToOne(() => User, (user) => user.chats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
