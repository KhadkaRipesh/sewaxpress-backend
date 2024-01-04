import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'service_category' })
export class ServiceCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category_name: string;
}
