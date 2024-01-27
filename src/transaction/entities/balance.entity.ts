import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('balance')
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
