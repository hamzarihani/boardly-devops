import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AgileService {
  constructor(private supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  // --- SPRINTS ---
  async getSprints() {
    const { data, error } = await this.supabase.from('sprints').select('*').order('start_date', { ascending: true });
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async createSprint(sprintDto: any) {
    const { data, error } = await this.supabase.from('sprints').insert(sprintDto).select().single();
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async updateSprint(id: string, sprintDto: any) {
    const { data, error } = await this.supabase.from('sprints').update(sprintDto).eq('id', id).select().single();
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async deleteSprint(id: string) {
    const { error } = await this.supabase.from('sprints').delete().eq('id', id);
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return { success: true };
  }

  // --- STORIES ---
  async getStories() {
    const { data, error } = await this.supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async createStory(storyDto: any) {
    const { data, error } = await this.supabase.from('stories').insert(storyDto).select().single();
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async updateStory(id: string, storyDto: any) {
    const { data, error } = await this.supabase.from('stories').update(storyDto).eq('id', id).select().single();
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async deleteStory(id: string) {
    const { error } = await this.supabase.from('stories').delete().eq('id', id);
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return { success: true };
  }

  // --- TASKS ---
  async getTasks() {
    const { data, error } = await this.supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async getTasksWithStories() {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*, stories!inner(title)')
      .order('created_at', { ascending: false });
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data.map((task: any) => ({
      ...task,
      storyTitle: task.stories?.title
    }));
  }

  async createTask(taskDto: any) {
    const { data, error } = await this.supabase.from('tasks').insert(taskDto).select().single();
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async updateTask(id: string, taskDto: any) {
    const { data, error } = await this.supabase.from('tasks').update(taskDto).eq('id', id).select().single();
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return data;
  }

  async deleteTask(id: string) {
    const { error } = await this.supabase.from('tasks').delete().eq('id', id);
    if (error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    return { success: true };
  }
}
