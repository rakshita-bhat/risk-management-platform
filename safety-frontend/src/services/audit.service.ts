import api from './api';

export const auditService = {
  async getAll(filters?: { status?: string; auditorId?: number; locationId?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.auditorId) params.append('auditorId', filters.auditorId.toString());
    if (filters?.locationId) params.append('locationId', filters.locationId.toString());
    const response = await api.get(`/audits?${params.toString()}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },

  async create(data: {
    title: string;
    description: string;
    auditorId: number;
    locationId?: number;
    status?: string;
  }) {
    const response = await api.post('/audits', data);
    return response.data;
  },

  async update(id: number, data: {
    title?: string;
    description?: string;
    status?: string;
    auditorId?: number;
    locationId?: number;
  }) {
    const response = await api.put(`/audits/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/audits/${id}`);
    return response.data;
  },
};