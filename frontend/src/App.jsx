import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';

function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowApp(true);
    }
  }, [loading]);

  if (!showApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <p className="text-sm text-slate-400">Initialisation de l&apos;application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setShowApp(true)} />;
  }

  if (user?.must_change_password) {
    return <ChangePassword />;
  }

  return <Dashboard />;
}

export default App;
