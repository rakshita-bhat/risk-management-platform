import api from './api';

export const riskService = {
  async getAll(filters?: { status?: string; assigneeId?: number; locationId?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId.toString());
    if (filters?.locationId) params.append('locationId', filters.locationId.toString());
    const response = await api.get(`/risks?${params.toString()}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/risks/${id}`);
    return response.data;
  },

  async create(data: {
    title: string;
    description: string;
    locationId?: number;
    assigneeId?: number;
    creatorId: number;
  }) {
    const response = await api.post('/risks', data);
    return response.data;
  },

  async update(id: number, data: {
    title?: string;
    description?: string;
    locationId?: number;
    assigneeId?: number;
    status?: string;
  }) {
    const response = await api.put(`/risks/${id}`, data);
    return response.data;
  },

  async updateStatus(id: number, status: string) {
    const response = await api.put(`/risks/${id}/status`, { status });
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/risks/${id}`);
    return response.data;
  },

  async addEvidence(id: number, evidenceUrls: string[]) {
    const response = await api.put(`/risks/${id}/evidence`, { evidenceUrls });
    return response.data;
  },
};