import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from '../project/project.entity';

export type SavedTestType = 'ui' | 'api';

@Entity()
export class SavedTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  type: SavedTestType;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  project?: Project;

  // For API tests: store endpoint, method, headers, body as JSON
  @Column({ type: 'simple-json', nullable: true })
  apiDetails?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
  };

  // For UI tests: store array of commands as JSON
  @Column({ type: 'simple-json', nullable: true })
  uiCommands?: Array<{ action: string; selector?: string; value?: string }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
