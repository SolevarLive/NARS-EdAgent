import axios from 'axios';
import {
  DashboardStats,
  ReplyIn,
  ReplyOut,
  OutreachLog,
  ProjectCatalogItem,
} from '../shared/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardService = {
  getStats: async () => {
    const { data } = await api.get<DashboardStats>('/dashboard');
    return data;
  },
  getDetails: async (days: number = 30) => {
    const { data } = await api.get(`/dashboard/details?days=${days}`);
    return data;
  },
};

export const classifyService = {
  checkSingle: async (payload: ReplyIn) => {
    const { data } = await api.post<ReplyOut>('/classify', payload);
    return data;
  },
  getLogs: async (skip = 0, limit = 100) => {
    // В swagger ответ 200 пустой schema, но по логике там массив логов.
    // Используем any или уточним тип позже.
    const { data } = await api.get(`/logs?skip=${skip}&limit=${limit}`);
    return data;
  },
};

export const outreachService = {
  getStatus: async () => {
    const { data } = await api.get<OutreachLog[]>('/outreach/status');
    return data;
  },
  sendEmail: async (company: string, email: string) => {
    const { data } = await api.post(
      `/outreach/send?company=${company}&email=${email}`
    );
    return data;
  },
};

export const projectService = {
  getCatalog: async () => {
    const { data } = await api.get<ProjectCatalogItem[]>('/projects/catalog');
    return data;
  },
};
