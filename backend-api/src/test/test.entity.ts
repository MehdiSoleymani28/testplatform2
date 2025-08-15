import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity()
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  framework: string;

  @Column('text')
  script: string;

  @Column()
  status: string;

  @ManyToOne(() => Project, project => project.tests, { onDelete: 'CASCADE' })
  project: Project;
}
