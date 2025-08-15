import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedTest } from './saved-test.entity';
import { CreateSavedTestDto, UpdateSavedTestDto } from './saved-test.dto';
import { Project } from '../project/project.entity';

@Injectable()
export class SavedTestService {
  constructor(
    @InjectRepository(SavedTest)
    private readonly savedTestRepository: Repository<SavedTest>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateSavedTestDto): Promise<SavedTest> {
    let project: Project | null = null;
    if (dto.projectId) {
      project = await this.projectRepository.findOne({ where: { id: dto.projectId } });
    }

    const saved = this.savedTestRepository.create({
      name: dto.name,
      type: dto.type,
      project: project ?? undefined,
      apiDetails: dto.apiDetails,
      uiCommands: dto.uiCommands,
    } as any);
  return (this.savedTestRepository.save(saved) as unknown) as SavedTest;
  }

  async findAll(): Promise<SavedTest[]> {
    return this.savedTestRepository.find({ relations: ['project'] });
  }

  async findOne(id: number): Promise<SavedTest | null> {
    return this.savedTestRepository.findOne({ where: { id }, relations: ['project'] });
  }

  async update(id: number, dto: UpdateSavedTestDto): Promise<SavedTest | null> {
    const saved = await this.savedTestRepository.findOne({ where: { id } });
    if (!saved) return null;
    if (dto.name) saved.name = dto.name;
    if (dto.type) saved.type = dto.type as any;
    if (dto.apiDetails) saved.apiDetails = dto.apiDetails;
    if (dto.uiCommands) saved.uiCommands = dto.uiCommands;
    await this.savedTestRepository.save(saved);
    return saved;
  }

  async remove(id: number): Promise<void> {
    await this.savedTestRepository.delete(id);
  }
}
