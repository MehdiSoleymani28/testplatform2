import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Project } from '../project/project.entity';
import { Test } from '../test/test.entity';

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

  @OneToMany(() => Test, test => test.page)
  tests: Test[];
}
