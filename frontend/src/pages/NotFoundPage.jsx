import React from 'react';
import { Link } from 'react-router';
import { Button, Card } from '../components/ui';
import { HelpCircle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 bg-white border border-[#EFE5E0] shadow-xl rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-[#111827]">
          404
        </h1>
        <p className="mt-2 text-base font-serif font-semibold text-[#111827]">
          Page Not Found
        </p>
        <p className="mt-1 text-sm text-[#6B7280]">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
