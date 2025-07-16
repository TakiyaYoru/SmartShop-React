// src/hooks/useAuth.js
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LOGIN_MUTATION, REGISTER_MUTATION, ME_QUERY } from '../graphql/auth';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  
  const [loginMutation, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data.login.success) {
        const { jwt, user } = data.login.data;
        login(jwt, user);
        toast.success(`Chào mừng ${user.firstName || user.username}!`);
        
        // Redirect based on role
        if (user.role === 'admin' || user.role === 'manager') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(data.login.message);
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
    }
  });

  const handleLogin = async (formData) => {
    try {
      await loginMutation({
        variables: {
          input: {
            username: formData.username,
            password: formData.password
          }
        }
      });
    } catch (err) {
      console.error('Login submission error:', err);
    }
  };

  return {
    login: handleLogin,
    loading,
    error
  };
};

export const useRegister = () => {
  const navigate = useNavigate();
  
  const [registerMutation, { loading, error }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      if (data.register.success) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        toast.error(data.register.message);
      }
    },
    onError: (error) => {
      console.error('Register error:', error);
      toast.error('Đăng ký thất bại. Vui lòng thử lại!');
    }
  });

  const handleRegister = async (formData) => {
    try {
      await registerMutation({
        variables: {
          input: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || ''
          }
        }
      });
    } catch (err) {
      console.error('Register submission error:', err);
    }
  };

  return {
    register: handleRegister,
    loading,
    error
  };
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthContext();
  
  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
    skip: !isAuthenticated,
    errorPolicy: 'all'
  });

  return {
    user: data?.me,
    loading,
    error,
    refetch
  };
};