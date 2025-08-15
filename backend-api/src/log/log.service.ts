import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './log.entity';
import { Test } from '../test/test.entity';
import { CreateLogDto, UpdateLogDto } from './log.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
  ) {}

  async findAll(): Promise<Log[]> {
    return this.logRepository.find({ relations: ['test'] });
  }

  async findOne(id: number): Promise<Log | null> {
    return this.logRepository.findOne({ where: { id }, relations: ['test'] });
  }

  async create(dto: CreateLogDto): Promise<Log> {
    const test = dto.testId ? await this.testRepository.findOne({ where: { id: dto.testId } }) : null;
    const log = this.logRepository.create({
      test: test ?? undefined,
      output: dto.output,
      executedAt: new Date(),
      status: dto.status,
    } as any);
  return (this.logRepository.save(log) as unknown) as Log;
  }

  async update(id: number, dto: UpdateLogDto): Promise<Log | null> {
    const log = await this.logRepository.findOne({ where: { id } });
    if (!log) return null;
    if (dto.output) log.output = dto.output;
    if (dto.status) log.status = dto.status;
    await this.logRepository.save(log);
    return log;
  }

  async remove(id: number): Promise<void> {
    await this.logRepository.delete(id);
  }
}
