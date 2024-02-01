import { Book } from 'src/book/entities/book.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { Room } from 'src/chat/entities/room.entity';
import { FirebaseToken } from 'src/firebase/entities/firebase-token.entity';
import { HubReview } from 'src/hub/entities/hub-review.entity';
import { Hub } from 'src/hub/entities/hub.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { OTP } from 'src/otp/entities/otp.entity';
import { ServiceProviderPaymentDetail } from 'src/service_provider/entities/service_provider-payment.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  CUSTOMER = 'CUSTOMER',
}

export interface IAddress {
  city: string;
  street_name: string;
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ nullable: true })
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({
    type: 'jsonb',
    default: {
      city: '',
      street_name: '',
      landmark: '',
    },
  })
  address: IAddress;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => OTP, (otp) => otp.user, { cascade: true })
  otps: OTP[];

  @OneToOne(() => Hub, (hub) => hub.user, { cascade: true })
  hub: Hub;

  @OneToMany(() => HubReview, (hub_review) => hub_review.user, {
    cascade: true,
  })
  hub_reviews: HubReview[];

  @OneToMany(() => Cart, (cart) => cart.customer, { cascade: true })
  carts: Cart[];

  @OneToMany(() => Book, (book) => book.customer, { cascade: true })
  bookings: Book[];

  @OneToMany(() => Room, (room) => room.customer, { cascade: true })
  rooms: Room[];

  @OneToMany(() => Chat, (chat) => chat.sender, { cascade: true })
  chats: Chat[];

  @OneToMany(() => FirebaseToken, (ftoken) => ftoken.user, { cascade: true })
  firebase_tokens: FirebaseToken[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  })
  notifications: Notification[];

  @OneToMany(() => ServiceProviderPaymentDetail, (payment) => payment.user, {
    cascade: true,
  })
  service_provider_payment_detail: ServiceProviderPaymentDetail[];
}
