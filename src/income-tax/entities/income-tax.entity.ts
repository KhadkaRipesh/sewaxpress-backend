import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('income_and_tax')
export class IncomeAndTax {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  vendor_commission: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  tax: number;
}
