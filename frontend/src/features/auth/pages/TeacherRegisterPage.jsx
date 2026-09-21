import React from 'react';
import AuthLayout from '../../../components/layout/AuthLayout';
import TeacherRegisterForm from '../components/TeacherRegisterForm';

export const TeacherRegisterPage = () => {
  return (
    <AuthLayout
      title="Faculty Registration"
      subtitle="Register as an instructor at The Girls Kingdom School and College Mardan"
    >
      <TeacherRegisterForm />
    </AuthLayout>
  );
};

export default TeacherRegisterPage;
