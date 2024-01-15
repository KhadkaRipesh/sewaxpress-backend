import { ServiceList } from 'src/servicelist/entities/service-list.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'service_category' })
export class ServiceCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category_name: string;

  @OneToMany(() => ServiceList, (serviceList) => serviceList.category, {
    cascade: true,
  })
  serviceList: ServiceList[];
}
