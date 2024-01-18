import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Service } from './service.entity';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category_name: string;

  @OneToMany(() => Service, (serviceList) => serviceList.category, {
    cascade: true,
  })
  serviceList: Service[];
}
