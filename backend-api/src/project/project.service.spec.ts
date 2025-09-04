import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProjectService', () => {
  let service: ProjectService;
  let repository: Repository<Project>;

  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    baseUrl: 'https://example.com',
    description: 'Test description' as string | null,
    createdAt: new Date(),
    pages: [],
    tests: [],
    apiEndpoints: [],
    apiCollections: []
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    repository = module.get<Repository<Project>>(getRepositoryToken(Project));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all projects with relations', async () => {
      mockRepository.find.mockResolvedValue([mockProject]);

      const result = await service.findAll();

      expect(result).toEqual([mockProject]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['pages', 'tests', 'apiEndpoints', 'apiCollections'],
        order: { createdAt: 'DESC' }
      });
    });

    it('should throw error when repository fails', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Failed to fetch projects: Database error');
    });
  });

  describe('findOne', () => {
    it('should return a project with relations', async () => {
      mockRepository.findOne.mockResolvedValue(mockProject);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProject);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['pages', 'tests', 'apiEndpoints', 'apiCollections']
      });
    });

    it('should throw NotFoundException when project not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne(1)).rejects.toThrow('Failed to fetch project: Database error');
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto: CreateProjectDto = {
        name: 'New Project',
        baseUrl: 'https://new.example.com'
      };

      mockRepository.create.mockReturnValue(mockProject);
      mockRepository.save.mockResolvedValue(mockProject);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProject);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'New Project',
        baseUrl: 'https://new.example.com',
        createdAt: expect.any(Date)
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockProject);
    });

    it('should throw error when repository fails', async () => {
      const createDto: CreateProjectDto = {
        name: 'New Project',
        baseUrl: 'https://new.example.com'
      };

      mockRepository.create.mockReturnValue(mockProject);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Failed to create project: Database error');
    });
  });

  describe('update', () => {
    it('should update an existing project', async () => {
      const updateDto: UpdateProjectDto = {
        name: 'Updated Project',
        baseUrl: 'https://updated.example.com'
      };

      jest.spyOn(service, 'findById').mockResolvedValue(mockProject);
      mockRepository.save.mockResolvedValue({ ...mockProject, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(result).toEqual({ ...mockProject, ...updateDto });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockProject,
        name: 'Updated Project',
        baseUrl: 'https://updated.example.com'
      });
    });

    it('should throw NotFoundException when project not found', async () => {
      const updateDto: UpdateProjectDto = {
        name: 'Updated Project'
      };

      jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException('Project with ID 1 not found'));

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockProject);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException('Project with ID 1 not found'));

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics', () => {
    it('should return project statistics', async () => {
      const projectWithData = {
        ...mockProject,
        pages: [{}, {}],
        tests: [{}],
        apiEndpoints: [{}, {}, {}],
        apiCollections: [{}]
      };

      mockRepository.findOne.mockResolvedValue(projectWithData);

      const result = await service.getStatistics(1);

      expect(result).toEqual({
        pagesCount: 2,
        testsCount: 1,
        endpointsCount: 3,
        collectionsCount: 1
      });
    });

    it('should return zero counts when no related entities', async () => {
      mockRepository.findOne.mockResolvedValue(mockProject);

      const result = await service.getStatistics(1);

      expect(result).toEqual({
        pagesCount: 0,
        testsCount: 0,
        endpointsCount: 0,
        collectionsCount: 0
      });
    });
  });

  describe('searchByName', () => {
    it('should search projects by name', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProject])
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchByName('test');

      expect(result).toEqual([mockProject]);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('project');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('project.name ILIKE :name', { name: '%test%' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('project.createdAt', 'DESC');
    });
  });
});
