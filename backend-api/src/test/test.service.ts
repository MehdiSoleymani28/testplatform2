import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './test.entity';
import { Project } from '../project/project.entity';
import { CreateTestDto, UpdateTestDto } from './test.dto';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private readonly testRepository: Repository<Test>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Test[]> {
    return this.testRepository.find({ relations: ['project'] });
  }

  async findOne(id: number): Promise<Test | null> {
    return this.testRepository.findOne({ where: { id }, relations: ['project'] });
  }

  async create(dto: CreateTestDto): Promise<Test> {
    const project = dto.projectId ? await this.projectRepository.findOne({ where: { id: dto.projectId } }) : null;
    const test = this.testRepository.create({
      framework: dto.framework,
      script: dto.script,
      status: dto.status ?? 'generated',
      project: project ?? undefined,
    } as any);
  return (this.testRepository.save(test) as unknown) as Test;
  }

  async update(id: number, dto: UpdateTestDto): Promise<Test | null> {
    const test = await this.testRepository.findOne({ where: { id } });
    if (!test) return null;
    if (dto.framework) test.framework = dto.framework;
    if (dto.script) test.script = dto.script;
    if (dto.status) test.status = dto.status;
    await this.testRepository.save(test);
    return test;
  }

  async remove(id: number): Promise<void> {
    await this.testRepository.delete(id);
  }
}
