import { ServiceCategory } from 'src/service-category/entities/category.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'services' })
export class ServiceList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category_id: string;
  @ManyToOne(() => ServiceCategory, (category) => category.serviceList, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column()
  name: string;

  @Column()
  description: string;
}
