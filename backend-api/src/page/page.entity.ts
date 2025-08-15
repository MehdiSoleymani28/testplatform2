import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity()
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true, type: 'text' })
  requirements?: string;

  @ManyToOne(() => Project, project => project.pages, { onDelete: 'CASCADE' })
  project: Project;
}
