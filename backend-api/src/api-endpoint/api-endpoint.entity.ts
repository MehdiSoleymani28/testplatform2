import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity()
export class ApiEndpoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  group?: string;

  @Column({ type: 'text', nullable: true })
  requirements?: string;

  @ManyToOne(() => Project, project => project.apiEndpoints, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToMany(() => require('../api-collection/api-collection.entity').ApiCollection, (collection: any) => collection.endpoints)
  collections?: any[];
}
