import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiEndpoint } from './api-endpoint.entity';
import { Project } from '../project/project.entity';
import { CreateApiEndpointDto, UpdateApiEndpointDto } from './api-endpoint.dto';

@Injectable()
export class ApiEndpointService {
  constructor(
    @InjectRepository(ApiEndpoint)
    private readonly apiEndpointRepository: Repository<ApiEndpoint>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<ApiEndpoint[]> {
    return this.apiEndpointRepository.find({ relations: ['project'] });
  }

  async findOne(id: number): Promise<ApiEndpoint | null> {
    return this.apiEndpointRepository.findOne({ where: { id }, relations: ['project'] });
  }

  async create(dto: CreateApiEndpointDto): Promise<ApiEndpoint> {
    const project = dto.projectId ? await this.projectRepository.findOne({ where: { id: dto.projectId } }) : null;
    const apiEndpoint = this.apiEndpointRepository.create({
      method: dto.method,
      url: dto.url,
      group: dto.group,
      project: project ?? undefined,
    } as any);
  return (this.apiEndpointRepository.save(apiEndpoint) as unknown) as ApiEndpoint;
  }

  async update(id: number, dto: UpdateApiEndpointDto): Promise<ApiEndpoint | null> {
    const apiEndpoint = await this.apiEndpointRepository.findOne({ where: { id } });
    if (!apiEndpoint) return null;
    if (dto.method) apiEndpoint.method = dto.method;
    if (dto.url) apiEndpoint.url = dto.url;
    if (dto.group) apiEndpoint.group = dto.group;
  await this.apiEndpointRepository.save(apiEndpoint);
  return apiEndpoint;
  }

  async remove(id: number): Promise<void> {
    await this.apiEndpointRepository.delete(id);
  }
}
