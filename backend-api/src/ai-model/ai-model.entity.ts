import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AiModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  apiKey: string;

  @Column({ default: false })
  isFallback: boolean;
}
