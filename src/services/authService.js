import API from './api';

const authService = {
  register: async (name, email, password) => {
    const response = await API.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  googleLogin: async (idToken, photoURL = '') => {
    const response = await API.post('/auth/google-login', { token: idToken, photoURL });
    return response.data;
  },

  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await API.put('/profile', profileData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await API.put('/profile/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
