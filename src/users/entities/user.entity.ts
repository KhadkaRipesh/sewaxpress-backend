import { OTP } from 'src/otp/entities/otp.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
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

  @Column({ select: false })
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
}
