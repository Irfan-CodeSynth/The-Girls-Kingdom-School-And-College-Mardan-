import React from 'react';
import { Link } from 'react-router';
import { Button, Card } from '../components/ui';
import { ShieldAlert, Home } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 bg-white border border-[#EFE5E0] shadow-xl rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-700 border border-red-200/60 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#111827]">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          You do not have the required permissions or role to view this section of the portal.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
