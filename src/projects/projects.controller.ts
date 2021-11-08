import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { IFindAllResponse } from './projects.interface';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectsService.createProject(createProjectDto);
  }

  @Get()
  findAllProjects(@Query('page') page: string): Promise<IFindAllResponse> {
    const limit = 5;
    const offset = page ? (Number(page) - 1) * limit : 0;
    return this.projectsService.findAll({
      take: limit,
      skip: offset,
    });
  }

  @Get('/:id')
  findProject(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOne(+id);
  }

  @Patch('/:id')
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete('/:id')
  deleteProject(@Param('id') id: string): Promise<Project> {
    return this.projectsService.delete(+id);
  }
}