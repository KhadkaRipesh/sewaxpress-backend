import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('service_provider_payment_details')
export class ServiceProviderPaymentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bank_name: string;

  @Column()
  account_name: string;

  @Column()
  account_number: string;

  @Column()
  branch_name: string;

  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.service_provider_payment_detail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
