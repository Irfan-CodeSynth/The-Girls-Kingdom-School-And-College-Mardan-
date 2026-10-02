import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { ROLES } from '../../../config/constants';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      return await login(email, password);
    },
    onSuccess: (data, variables) => {
      toast.success('Welcome back!');
      // Navigate based on role will be handled by redirection or dashboard
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login error full object:', error);
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (typeof error.response?.data === 'string' ? error.response?.data : null) ||
        error.message;
      const statusText = error.response?.status ? ` [HTTP ${error.response.status}]` : '';
      const msg = `${serverMsg || 'Login failed. Please check your credentials.'}${statusText}`;
      toast.error(msg);
    },
  });
};

export default useLogin;
