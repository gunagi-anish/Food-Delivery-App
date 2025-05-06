import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to handle authentication
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make sure not to override content-type for form data
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
API.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access, clearing token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  verifyAdminCode: (code) => API.post('/auth/verify-admin-code', { code }),
  registerAdmin: (data) => API.post('/auth/register-admin', data),
};

// Restaurant API
export const restaurantAPI = {
  getAll: () => API.get('/restaurants'),
  getById: (id) => API.get(`/restaurants/${id}`),
  getMenu: (id) => API.get(`/restaurants/${id}/menu`),
  updateStatus: (id, isActive) => {
    console.log('Updating restaurant status:', { id, isActive });
    return API.patch(`/restaurants/${id}/status`, { isActive });
  }
};

// Order API
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getById: (id) => API.get(`/orders/${id}`),
  getUserOrders: () => API.get('/orders/user'),
};

// Admin API
export const adminAPI = {
  getAllOrders: () => API.get('/admin/orders'),
  updateOrderStatus: (orderId, status) => API.patch(`/admin/orders/${orderId}/status`, { status }),
  getAllRestaurants: () => API.get('/admin/restaurants'),
  updateRestaurant: (restaurantId, data) => API.patch(`/admin/restaurants/${restaurantId}`, data),
  createRestaurant: (data) => {
    console.log('=== Creating Restaurant ===');
    console.log('Base URL:', API.defaults.baseURL);
    console.log('Full URL:', `${API.defaults.baseURL}/admin/restaurants`);
    console.log('Data:', data);
    console.log('Token:', localStorage.getItem('token'));
    return API.post('/admin/restaurants', data);
  }
};

export default API;
