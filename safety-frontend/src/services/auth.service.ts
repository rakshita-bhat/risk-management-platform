import api from './api';

export const authService = {
  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await api.post('/auth/register', { email, password, firstName, lastName });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.access_token);
    
    try {
      const profileResponse = await api.get('/auth/profile');
      localStorage.setItem('user', JSON.stringify(profileResponse.data));
    } catch (e) {
      localStorage.setItem('user', JSON.stringify({ email, firstName: email.split('@')[0], lastName: '', role: 'user' }));
    }
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};