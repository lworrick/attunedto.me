import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Home } from 'lucide-react';

export const NotFoundScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page not found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
