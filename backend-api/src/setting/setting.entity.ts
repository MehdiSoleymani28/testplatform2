import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, project => project.id, { nullable: true, onDelete: 'CASCADE' })
  project?: Project;

  @Column()
  key: string;

  @Column('text')
  value: string;
}
