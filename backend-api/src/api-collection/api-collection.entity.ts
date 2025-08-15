import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Project } from '../project/project.entity';
import { ApiEndpoint } from '../api-endpoint/api-endpoint.entity';

@Entity()
export class ApiCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Project, project => project.apiCollections, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToMany(() => ApiEndpoint, endpoint => endpoint.collections)
  @JoinTable({ name: 'api_collection_endpoints' })
  endpoints: ApiEndpoint[];
}
