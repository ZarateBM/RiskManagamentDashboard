import axios from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: {
    email: string;
    id: string;
    nombre: string;
    rol: string;
  } | null;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  }
};