import React from 'react';
import AuthLayout from '../../../components/layout/AuthLayout';
import StudentRegisterForm from '../components/StudentRegisterForm';

export const StudentRegisterPage = () => {
  return (
    <AuthLayout
      title="Student Registration"
      subtitle="Join The Girls Kingdom School and College Mardan learning community"
    >
      <StudentRegisterForm />
    </AuthLayout>
  );
};

export default StudentRegisterPage;
