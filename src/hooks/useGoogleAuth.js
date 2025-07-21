// src/hooks/useGoogleAuth.js

import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GOOGLE_AUTH_MUTATION, COMPLETE_PROFILE_MUTATION } from '../graphql/googleAuth';
import { useAuth } from '../contexts/AuthContext';

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [googleAuthMutation, { loading, error }] = useMutation(GOOGLE_AUTH_MUTATION, {
    onCompleted: (data) => {
      console.log('🔥 Google Auth completed:', data);
      
      if (data.googleAuth.success) {
        const { token, user, requiresProfileCompletion } = data.googleAuth;
        
        // Save user and token
        login(token, user);
        
        toast.success(`Chào mừng ${user.firstName || user.username}!`);
        
        if (requiresProfileCompletion === true) {
          // Chỉ user mới, thiếu thông tin mới vào trang welcome
          navigate('/welcome');
        } else {
          // User đã có tài khoản, vào thẳng trang chính hoặc admin
          if (user.role === 'admin' || user.role === 'manager') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } else {
        toast.error(data.googleAuth.message || 'Đăng nhập Google thất bại');
      }
    },
    onError: (error) => {
      console.error('❌ Google Auth error:', error);
      toast.error('Đăng nhập Google thất bại. Vui lòng thử lại!');
    }
  });

  const handleGoogleAuth = async (googleToken) => {
    try {
      console.log('🔥 Starting Google Auth with token:', googleToken);
      
      await googleAuthMutation({
        variables: {
          input: {
            token: googleToken
          }
        }
      });
    } catch (err) {
      console.error('❌ Google Auth submission error:', err);
    }
  };

  return {
    googleAuth: handleGoogleAuth,
    loading,
    error
  };
};

export const useCompleteProfile = () => {
  const navigate = useNavigate();
  
  const [completeProfileMutation, { loading, error }] = useMutation(COMPLETE_PROFILE_MUTATION, {
    onCompleted: (data) => {
      console.log('🔥 Complete Profile completed:', data);
      
      if (data.completeProfile.success) {
        toast.success('Hoàn thiện thông tin thành công!');
        navigate('/'); // Redirect to homepage
      } else {
        toast.error(data.completeProfile.message || 'Lỗi khi hoàn thiện thông tin');
      }
    },
    onError: (error) => {
      console.error('❌ Complete Profile error:', error);
      toast.error('Lỗi khi hoàn thiện thông tin. Vui lòng thử lại!');
    }
  });

  const handleCompleteProfile = async (profileData) => {
    try {
      console.log('🔥 Completing profile with data:', profileData);
      
      await completeProfileMutation({
        variables: {
          input: profileData
        }
      });
    } catch (err) {
      console.error('❌ Complete Profile submission error:', err);
    }
  };

  return {
    completeProfile: handleCompleteProfile,
    loading,
    error
  };
};