import { Injectable, NotFoundException } from '@nestjs/common';
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

  /**
   * Retrieve all projects with their related entities
   */
  async findAll(): Promise<Project[]> {
    try {
      return await this.projectRepository.find({
        relations: ['pages', 'tests', 'apiEndpoints', 'apiCollections'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }

  /**
   * Find a project by ID with all related entities
   */
  async findOne(id: number): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['pages', 'tests', 'apiEndpoints', 'apiCollections']
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }

  /**
   * Find a project by ID without relations (for internal use)
   */
  async findById(id: number): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({ where: { id } });
      
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }

  /**
   * Create a new project
   */
  async create(dto: CreateProjectDto): Promise<Project> {
    try {
      const project = this.projectRepository.create({
        name: dto.name,
        baseUrl: dto.baseUrl,
        createdAt: new Date(),
      });
      
      return await this.projectRepository.save(project);
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Update an existing project
   */
  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    try {
      const project = await this.findById(id);
      
      if (dto.name) project.name = dto.name;
      if (dto.baseUrl) project.baseUrl = dto.baseUrl;
      
      return await this.projectRepository.save(project);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Delete a project
   */
  async remove(id: number): Promise<void> {
    try {
      const project = await this.findById(id);
      await this.projectRepository.remove(project);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Get project statistics (count of related entities)
   */
  async getStatistics(id: number): Promise<{
    pagesCount: number;
    testsCount: number;
    endpointsCount: number;
    collectionsCount: number;
  }> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['pages', 'tests', 'apiEndpoints', 'apiCollections']
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return {
        pagesCount: project.pages?.length || 0,
        testsCount: project.tests?.length || 0,
        endpointsCount: project.apiEndpoints?.length || 0,
        collectionsCount: project.apiCollections?.length || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to get project statistics: ${error.message}`);
    }
  }

  /**
   * Search projects by name
   */
  async searchByName(name: string): Promise<Project[]> {
    try {
      return await this.projectRepository
        .createQueryBuilder('project')
        .where('project.name ILIKE :name', { name: `%${name}%` })
        .orderBy('project.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      throw new Error(`Failed to search projects: ${error.message}`);
    }
  }
}
