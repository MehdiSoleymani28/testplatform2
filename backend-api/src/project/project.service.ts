import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['pages', 'tests', 'apiEndpoints'] });
  }

  async findOne(id: number): Promise<Project | null> {
    return this.projectRepository.findOne({ where: { id }, relations: ['pages', 'tests', 'apiEndpoints'] });
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create({
      name: dto.name,
      baseUrl: dto.baseUrl,
      createdAt: new Date(),
    });
    return this.projectRepository.save(project);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project | null> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) return null;
    if (dto.name) project.name = dto.name;
    if (dto.baseUrl) project.baseUrl = dto.baseUrl;
    await this.projectRepository.save(project);
    return project;
  }

  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
