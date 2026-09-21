import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (origin.includes('8081-')) {
      return origin.replace('8081-', '8080-');
    }
  }
  return 'http://localhost:8080';
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEmployees = async (department) => {
  try {
    const params = department && department !== 'All' ? { department } : {};
    const response = await apiClient.get('/api/employees', { params });
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getEmployeeById = async (id) => {
  const response = await apiClient.get(`/api/employees/${id}`);
  return response.data;
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post('/api/employees', employeeData);
    return { data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to create employee';
    return { error: message };
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await apiClient.put(`/api/employees/${id}`, employeeData);
    return { data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to update employee';
    return { error: message };
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(`/api/employees/${id}`);
    return { data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to delete employee';
    return { error: message };
  }
};

export const checkInAttendance = async (data) => {
  try {
    const payload = typeof data === 'object' ? data : { employeeId: data };
    const response = await apiClient.post('/api/attendance/check-in', payload);
    return { data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Check-in failed';
    return { error: message };
  }
};

export const checkOutAttendance = async (data) => {
  try {
    const payload = typeof data === 'object' ? data : { employeeId: data };
    const response = await apiClient.put('/api/attendance/check-out', payload);
    return { data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Check-out failed';
    return { error: message };
  }
};

export const getAllAttendance = async () => {
  try {
    const response = await apiClient.get('/api/attendance');
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getAttendanceReport = async (params) => {
  try {
    let queryParams = {};
    if (typeof params === 'string' || typeof params === 'number') {
      queryParams = { employeeId: params };
    } else if (params && typeof params === 'object') {
      queryParams = params;
    }
    const response = await apiClient.get('/api/attendance/report', { params: queryParams });
    return { data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to fetch attendance report';
    return { error: message };
  }
};

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/api/auth/login', credentials);
    const token = response.data.token || response.data.jwt;
    let role = response.data.role || response.data.userRole;
    if (!role && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role;
      } catch (e) {}
    }
    const finalRole = (role && role.toUpperCase().includes('ADMIN')) ? 'ADMIN' : 'EMPLOYEE';
    const employeeId = response.data.employeeId || '';
    const name = response.data.name || '';
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', finalRole);
      localStorage.setItem('email', credentials.email);
      if (employeeId) localStorage.setItem('employeeId', employeeId);
      if (name) localStorage.setItem('name', name);
    }
    return { token, role: finalRole, employeeId, name, data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Invalid credentials';
    return { error: message };
  }
};

export const register = async (userData) => {
  try {
    const response = await apiClient.post('/api/auth/register', userData);
    return { data: response.data };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Registration failed';
    return { error: message };
  }
};

export const getHolidays = async () => {
  try {
    const response = await apiClient.get('/api/holidays');
    return response.data;
  } catch (error) {
    return [];
  }
};

export const addHoliday = async (holiday) => {
  try {
    const response = await apiClient.post('/api/holidays', holiday);
    return { data: response.data };
  } catch (error) {
    return { error: error.response?.data?.message || 'Failed to add holiday' };
  }
};

export const deleteHoliday = async (id) => {
  try {
    await apiClient.delete(`/api/holidays/${id}`);
    return { success: true };
  } catch (error) {
    return { error: error.response?.data?.message || 'Failed to delete holiday' };
  }
};

export const getCorrections = async () => {
  try {
    const response = await apiClient.get('/api/corrections');
    return response.data;
  } catch (error) {
    return [];
  }
};

export const submitCorrection = async (correctionData) => {
  try {
    const response = await apiClient.post('/api/corrections', correctionData);
    return { data: response.data };
  } catch (error) {
    return { error: error.response?.data?.message || 'Failed to submit correction' };
  }
};

export const updateCorrectionStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`/api/corrections/${id}`, { status });
    return { data: response.data };
  } catch (error) {
    return { error: error.response?.data?.message || 'Failed to update correction' };
  }
};

export default apiClient;
