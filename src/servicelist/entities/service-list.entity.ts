import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'services' })
export class ServiceList {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
