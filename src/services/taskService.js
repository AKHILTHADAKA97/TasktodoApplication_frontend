import API from './api';

const taskService = {
  getTasks: async ({ filter, search, sort } = {}) => {
    const response = await API.get('/tasks', {
      params: { filter, search, sort },
    });
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await API.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await API.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await API.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await API.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;
