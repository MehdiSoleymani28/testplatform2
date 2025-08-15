import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiModel } from './ai-model.entity';
import { CreateAiModelDto, UpdateAiModelDto } from './ai-model.dto';

@Injectable()
export class AiModelService {
  constructor(
    @InjectRepository(AiModel)
    private readonly aiModelRepository: Repository<AiModel>,
  ) {}

  async findAll(): Promise<AiModel[]> {
    return this.aiModelRepository.find();
  }

  async findOne(id: number): Promise<AiModel | null> {
    return this.aiModelRepository.findOne({ where: { id } });
  }

  async create(dto: CreateAiModelDto): Promise<AiModel> {
    const aiModel = this.aiModelRepository.create({
      name: dto.name,
      apiKey: dto.apiKey,
      isFallback: dto.isFallback ?? false,
    });
    return this.aiModelRepository.save(aiModel);
  }

  async update(id: number, dto: UpdateAiModelDto): Promise<AiModel | null> {
    const aiModel = await this.aiModelRepository.findOne({ where: { id } });
    if (!aiModel) return null;
    if (dto.name) aiModel.name = dto.name;
    if (dto.apiKey) aiModel.apiKey = dto.apiKey;
    if (dto.isFallback !== undefined) aiModel.isFallback = dto.isFallback;
    await this.aiModelRepository.save(aiModel);
    return aiModel;
  }

  async remove(id: number): Promise<void> {
    await this.aiModelRepository.delete(id);
  }
}
