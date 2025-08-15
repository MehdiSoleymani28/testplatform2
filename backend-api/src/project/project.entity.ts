import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Page } from '../page/page.entity';
import { Test } from '../test/test.entity';
import { ApiEndpoint } from '../api-endpoint/api-endpoint.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  baseUrl: string;

  @Column()
  createdAt: Date;

  @OneToMany(() => Page, page => page.project)
  pages: Page[];

  @OneToMany(() => Test, test => test.project)
  tests: Test[];

  @OneToMany(() => ApiEndpoint, api => api.project)
  apiEndpoints: ApiEndpoint[];

  @OneToMany(() => require('../api-collection/api-collection.entity').ApiCollection, (c: any) => c.project)
  apiCollections: any[];
}
