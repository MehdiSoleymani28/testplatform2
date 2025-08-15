import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';
import { Project } from '../project/project.entity';
import { CreatePageDto, UpdatePageDto } from './page.dto';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Page[]> {
    return this.pageRepository.find({ relations: ['project'] });
  }

  async findOne(id: number): Promise<Page | null> {
    return this.pageRepository.findOne({ where: { id }, relations: ['project'] });
  }

  async create(dto: CreatePageDto): Promise<Page> {
    const project = dto.projectId ? await this.projectRepository.findOne({ where: { id: dto.projectId } }) : null;
    const page = this.pageRepository.create({
      url: dto.url,
      requirements: dto.requirements,
      project: project ?? undefined,
    } as any);
  return (this.pageRepository.save(page) as unknown) as Page;
  }

  async update(id: number, dto: UpdatePageDto): Promise<Page | null> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) return null;
    if (dto.url) page.url = dto.url;
    if (dto.requirements) page.requirements = dto.requirements;
    await this.pageRepository.save(page);
    return page;
  }

  async remove(id: number): Promise<void> {
    await this.pageRepository.delete(id);
  }
}
