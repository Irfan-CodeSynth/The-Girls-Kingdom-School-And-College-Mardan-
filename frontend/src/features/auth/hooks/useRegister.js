import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export const useRegister = (role = 'student') => {
  const { register } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data) => {
      return await register(data, role);
    },
    onSuccess: () => {
      toast.success('Registration successful! Welcome to The Girls Kingdom School and College Mardan.');
      navigate('/dashboard');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    },
  });
};

export default useRegister;
