import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './test.entity';
import { Project } from '../project/project.entity';
import { CreateTestDto, UpdateTestDto, BulkCreateTestsDto, BulkCreateTestItemDto } from './test.dto';

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

  async findByProject(projectId: number): Promise<Test[]> {
    return this.testRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect('test.project', 'project')
      .where('project.id = :projectId', { projectId })
      .orderBy('test.createdAt', 'DESC')
      .getMany();
  }

  async create(dto: CreateTestDto): Promise<Test> {
    const project = dto.projectId ? await this.projectRepository.findOne({ where: { id: dto.projectId } }) : null;
    const test = this.testRepository.create({
      name: (dto.name && dto.name.trim().length > 0) ? dto.name.trim() : this.generateDefaultName(dto),
      description: (dto.description && dto.description.trim().length > 0) ? dto.description.trim() : this.generateDefaultDescription(dto),
      status: dto.status ?? 'generated',
      framework: dto.framework,
      script: dto.script,
      project: project ?? undefined,
    });
    return this.testRepository.save(test);
  }

  async createBulk(dto: BulkCreateTestsDto): Promise<Test[]> {
    const project = dto.projectId
      ? await this.projectRepository.findOne({ where: { id: dto.projectId } })
      : null;
    if (!project) {
      // Keep behavior consistent: throw to surface a bad request
      throw new Error('Invalid projectId');
    }

    const items: BulkCreateTestItemDto[] = Array.isArray(dto.tests) ? dto.tests : [];
    if (items.length === 0) return [];

    const toCreate = items.map((item, index) =>
      this.testRepository.create({
        name:
          item.name && item.name.trim().length > 0
            ? item.name.trim()
            : this.generateDefaultName({
                framework: item.framework,
                script: item.script,
                projectId: dto.projectId,
              } as CreateTestDto),
        description:
          item.description && item.description.trim().length > 0
            ? item.description.trim()
            : this.generateDefaultDescription({
                framework: item.framework,
                script: item.script,
                projectId: dto.projectId,
              } as CreateTestDto),
        status: 'generated',
        framework: item.framework,
        script: item.script,
        project,
      }),
    );

    return this.testRepository.save(toCreate);
  }

  private generateDefaultName(dto: CreateTestDto): string {
    const fw = (dto.framework || 'generic').toString();
    const ts = new Date().toISOString();
    return `Generated Test (${fw}) ${ts}`;
  }

  private generateDefaultDescription(dto: CreateTestDto): string {
    const fw = dto.framework ? `Framework: ${dto.framework}. ` : '';
    const scriptHint = dto.script ? `Script length: ${dto.script.length}. ` : '';
    return `${fw}${scriptHint}Auto-created at ${new Date().toISOString()}`;
  }

  async update(id: number, dto: UpdateTestDto): Promise<Test | null> {
    const test = await this.testRepository.findOne({ where: { id } });
    if (!test) return null;
    if (dto.name) test.name = dto.name;
    if (dto.description) test.description = dto.description;
    if (dto.status) test.status = dto.status;
    if (dto.framework !== undefined) test.framework = dto.framework;
    if (dto.script !== undefined) test.script = dto.script;
    await this.testRepository.save(test);
    return test;
  }

  async remove(id: number): Promise<void> {
    await this.testRepository.delete(id);
  }
}
