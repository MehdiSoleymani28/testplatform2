import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../project/project.entity';
import { Page } from '../page/page.entity';

@Entity()
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  framework?: string;

  @Column({ type: 'text', nullable: true })
  script?: string;

  @ManyToOne(() => Project, project => project.tests, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => Page, page => page.tests, { onDelete: 'CASCADE', nullable: true })
  page: Page;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
