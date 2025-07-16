// src/pages/RegisterPage.jsx
import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { AuthLayout } from '../components/common/Layout';
import { GuestRoute } from '../components/auth/ProtectedRoute';

const RegisterPage = () => {
  return (
    <GuestRoute>
      <AuthLayout>
        <RegisterForm />
      </AuthLayout>
    </GuestRoute>
  );
};

export default RegisterPage;