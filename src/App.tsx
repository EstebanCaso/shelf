import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import Dashboard from '@/components/Dashboard/Dashboard';
import '@/index.css'; 
import InitialProfileSelector from '@/components/Layout/InitialProfileSelector';

const AppContent: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { profile, setProfile, isLoading: profileLoading } = useProfile();

  // Resetear perfil cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setProfile(null);
    }
  }, [user, setProfile]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return isLoginMode ? (
      <LoginForm onToggleMode={() => setIsLoginMode(false)} />
    ) : (
      <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
    );
  }

  if (!profile) {
    return <InitialProfileSelector />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;