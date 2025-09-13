import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  ParseIntPipe, 
  HttpCode, 
  HttpException,
  Query,
  NotFoundException
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { Project } from './project.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(): Promise<Project[]> {
    try {
      return await this.projectService.findAll();
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    try {
      return await this.projectService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(error.message, 500);
    }
  }

  @Get(':id/tests')
  async getProjectTests(@Param('id', ParseIntPipe) id: number) {
    try {
      const project = await this.projectService.findOne(id);
      return project.tests ?? [];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(error.message, 500);
    }
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.projectService.getStatistics(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(error.message, 500);
    }
  }

  @Get('search/by-name')
  async searchByName(@Query('name') name: string): Promise<Project[]> {
    try {
      if (!name) {
        throw new HttpException('Name query parameter is required', 400);
      }
      return await this.projectService.searchByName(name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, 500);
    }
  }

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      return await this.projectService.create(createProjectDto);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    try {
      return await this.projectService.update(id, updateProjectDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(error.message, 500);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.projectService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(error.message, 500);
    }
  }
}
