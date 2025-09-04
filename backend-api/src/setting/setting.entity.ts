import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id', nullable: true })
  projectId?: number;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project?: Project;

  @Column({ unique: false })
  key: string;

  @Column('text')
  value: string;
}
