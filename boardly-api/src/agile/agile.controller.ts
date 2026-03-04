import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AgileService } from './agile.service';

@Controller('agile')
export class AgileController {
  constructor(private readonly agileService: AgileService) {}

  // --- SPRINT ENDPOINTS ---
  @Get('sprints')
  getSprints() {
    return this.agileService.getSprints();
  }

  @Post('sprints')
  createSprint(@Body() sprintDto: any) {
    return this.agileService.createSprint(sprintDto);
  }

  @Put('sprints/:id')
  updateSprint(@Param('id') id: string, @Body() sprintDto: any) {
    return this.agileService.updateSprint(id, sprintDto);
  }

  @Delete('sprints/:id')
  deleteSprint(@Param('id') id: string) {
    return this.agileService.deleteSprint(id);
  }

  // --- STORY ENDPOINTS ---
  @Get('stories')
  getStories() {
    return this.agileService.getStories();
  }

  @Post('stories')
  createStory(@Body() storyDto: any) {
    return this.agileService.createStory(storyDto);
  }

  @Put('stories/:id')
  updateStory(@Param('id') id: string, @Body() storyDto: any) {
    return this.agileService.updateStory(id, storyDto);
  }

  @Delete('stories/:id')
  deleteStory(@Param('id') id: string) {
    return this.agileService.deleteStory(id);
  }

  // --- TASK ENDPOINTS ---
  @Get('tasks')
  getTasks() {
    return this.agileService.getTasks();
  }

  @Post('tasks')
  createTask(@Body() taskDto: any) {
    return this.agileService.createTask(taskDto);
  }

  @Put('tasks/:id')
  updateTask(@Param('id') id: string, @Body() taskDto: any) {
    return this.agileService.updateTask(id, taskDto);
  }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: string) {
    return this.agileService.deleteTask(id);
  }
}
