import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Service } from './service.entity';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category_name: string;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => Service, (serviceList) => serviceList.category, {
    cascade: true,
  })
  service: Service[];
}
