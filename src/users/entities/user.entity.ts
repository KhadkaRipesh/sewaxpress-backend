import { Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  admin = 'ADMIN',
  seller = 'SELLER',
  customer = 'CUSTOMER',
}
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: string;
}
