import api from './api';

export const locationService = {
  async getAll() {
    const response = await api.get('/locations');
    return response.data;
  },

  async getTree() {
    const response = await api.get('/locations/tree');
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  async create(data: { name: string; description?: string; parentId?: number }) {
    const response = await api.post('/locations', data);
    return response.data;
  },

  async update(id: number, data: { name?: string; description?: string; parentId?: number }) {
    const response = await api.put(`/locations/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },
};