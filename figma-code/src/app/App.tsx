import React from 'react';
import { RouterProvider } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { router } from './routes';
import { AuthScreen } from './screens/AuthScreen';
import { Toaster } from 'sonner';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[--sand] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--clay] mx-auto"></div>
          <p className="mt-4 text-[--basalt]" style={{ fontFamily: 'var(--font-inter)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <RouterProvider router={router} />;
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
        <Toaster position="top-center" />
      </DataProvider>
    </AuthProvider>
  );
}