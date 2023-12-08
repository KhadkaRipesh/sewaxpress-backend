import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
export enum OTPType {
  emailVerification = 'EMAIL_VERIFICATION',
  phoneVerification = 'PHONE_VERIFICATION',
  passwordReset = 'PASSWORD_RESET',
}

@Entity({ name: 'otp' })
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 6 })
  code: string;

  @Column({ type: 'enum', enum: OTPType })
  type: OTPType;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  user_id: string;
  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
