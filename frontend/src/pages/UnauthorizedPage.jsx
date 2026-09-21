import React from 'react';
import { Link } from 'react-router';
import { Button, Card } from '../components/ui';
import { ShieldAlert, Home } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-danger-50 dark:bg-danger-950/60 text-danger-600 dark:text-danger-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
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
