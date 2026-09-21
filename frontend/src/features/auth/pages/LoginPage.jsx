import React from 'react';
import AuthLayout from '../../../components/layout/AuthLayout';
import LoginForm from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to The Girls Kingdom School and College Mardan portal"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
