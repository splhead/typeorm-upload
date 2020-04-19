import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'categories' })
class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column('time with time zone')
  created_at: Date;

  @Column('time with time zone')
  updated_at: Date;
}

export default Category;
