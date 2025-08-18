import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Page } from '../page/page.entity';
import { Test } from '../test/test.entity';
import { ApiEndpoint } from '../api-endpoint/api-endpoint.entity';
import { ApiCollection } from '../api-collection/api-collection.entity';

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

  @OneToMany(() => Page, (page: Page) => page.project)
  pages: Page[];

  @OneToMany(() => Test, (test: Test) => test.project)
  tests: Test[];

  @OneToMany(() => ApiEndpoint, (api: ApiEndpoint) => api.project)
  apiEndpoints: ApiEndpoint[];

  @OneToMany(() => ApiCollection, (collection: ApiCollection) => collection.project)
  apiCollections: ApiCollection[];
}
