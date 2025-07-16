import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { GuestRoute } from '../components/auth/ProtectedRoute';
import { AuthLayout } from '../components/common/Layout';

const LoginPage = () => {
  return (
    <GuestRoute>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </GuestRoute>
  );
};

export default LoginPage;
