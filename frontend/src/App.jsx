import { useState, useEffect } from 'react';
import Login from './components/Login';
import ClientForm from './components/ClientForm';
import ClientList from './components/ClientList';
import { authService } from './services/authService';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = authService.getToken();
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (newToken) => {
    authService.setToken(newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    setError('');
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setIsAuthenticated(false);
    setError('');
  };

  const handleTokenExpired = () => {
    setError('Votre session a expiré. Veuillez vous reconnecter.');
    handleLogout();
  };

  const handleClientCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return (
      <div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Simulio</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire de création */}
            <div>
              <ClientForm 
                token={token} 
                onClientCreated={handleClientCreated}
                onTokenExpired={handleTokenExpired}
              />
            </div>
            
            {/* Liste des clients */}
            <div>
              <ClientList 
                token={token} 
                refreshTrigger={refreshTrigger}
                onTokenExpired={handleTokenExpired}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
