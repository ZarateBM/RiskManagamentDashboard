import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authservice';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login({ email, password });
      
      if (response.success) {
        router.push('/dashboard');
        if (rememberMe) {
          localStorage.setItem('userData', JSON.stringify(response.user));
        }
        sessionStorage.setItem('userData', JSON.stringify(response.user));

      } else {
        setError('Credenciales inválidas');
      }
    } catch (error ) {
        if (error instanceof Error) {
          router.push('/dashboard');
          setError(error.message);
        }
        else {
          setError('Error desconocido');
        }
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};