import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';
import { Project } from '../project/project.entity';
import { CreateSettingDto, UpdateSettingDto } from './setting.dto';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(projectId?: number): Promise<Setting[]> {
    if (projectId) {
      return this.settingRepository.find({ where: { project: { id: projectId } }, relations: ['project'] });
    }
    return this.settingRepository.find({ relations: ['project'] });
  }

  async findOne(id: number): Promise<Setting | null> {
    return this.settingRepository.findOne({ where: { id }, relations: ['project'] });
  }

  async create(dto: CreateSettingDto): Promise<Setting> {
    let project: Project | null = null;
    if (dto.projectId) {
      project = await this.projectRepository.findOne({ where: { id: dto.projectId } });
    }
    const setting = this.settingRepository.create({
      project: project ?? undefined,
      key: dto.key,
      value: dto.value,
    } as any);
    return (this.settingRepository.save(setting) as unknown) as Setting;
  }

  async update(id: number, dto: UpdateSettingDto): Promise<Setting | null> {
    const setting = await this.settingRepository.findOne({ where: { id } });
    if (!setting) return null;
    if (dto.key) setting.key = dto.key;
    if (dto.value) setting.value = dto.value;
    await this.settingRepository.save(setting);
    return setting;
  }

  async remove(id: number): Promise<void> {
    await this.settingRepository.delete(id);
  }
}
