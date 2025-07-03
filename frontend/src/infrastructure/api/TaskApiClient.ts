import axios, { AxiosInstance } from 'axios';
import { Priority } from '../../domain/entities';

export interface ApiTaskResponse {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  is_done: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiCreateTaskRequest {
  title: string;
  description: string;
  priority: Priority;
}

export interface ApiUpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: Priority;
}

export class TaskApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.detail) {
          throw new Error(error.response.data.detail);
        }
        throw new Error(error.message || 'An unexpected error occurred');
      }
    );
  }

  async getAllTasks(): Promise<ApiTaskResponse[]> {
    const response = await this.client.get<ApiTaskResponse[]>('/tasks/');
    return response.data;
  }

  async getTasksByStatus(isDone: boolean): Promise<ApiTaskResponse[]> {
    const response = await this.client.get<ApiTaskResponse[]>(`/tasks/status/${isDone}`);
    return response.data;
  }


  async createTask(params: ApiCreateTaskRequest): Promise<ApiTaskResponse> {
    const response = await this.client.post<ApiTaskResponse>('/tasks/', params);
    return response.data;
  }

  async updateTask(id: string, params: ApiUpdateTaskRequest): Promise<ApiTaskResponse> {
    const response = await this.client.put<ApiTaskResponse>(`/tasks/${id}`, params);
    return response.data;
  }

  async markTaskAsDone(id: string): Promise<ApiTaskResponse> {
    const response = await this.client.patch<ApiTaskResponse>(`/tasks/${id}/done`);
    return response.data;
  }

  async markTaskAsPending(id: string): Promise<ApiTaskResponse> {
    const response = await this.client.patch<ApiTaskResponse>(`/tasks/${id}/pending`);
    return response.data;
  }

  async archiveTask(id: string): Promise<ApiTaskResponse> {
    const response = await this.client.patch<ApiTaskResponse>(`/tasks/${id}/archive`);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete(`/tasks/${id}`);
  }
}