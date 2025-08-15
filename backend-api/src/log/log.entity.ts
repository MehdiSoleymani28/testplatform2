import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Test } from '../test/test.entity';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Test, test => test.id, { onDelete: 'CASCADE' })
  test: Test;

  @Column('text')
  output: string;

  @Column()
  executedAt: Date;

  @Column()
  status: string;
}
