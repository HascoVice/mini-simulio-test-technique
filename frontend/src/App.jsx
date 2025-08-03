import { useState, useEffect } from 'react';
import { Home, Calculator, Users, LogOut, History } from 'lucide-react';
import Login from './components/Login';
import ClientForm from './components/ClientForm';
import ClientList from './components/ClientList';
import SimulationForm from './components/SimulationForm';
import SimulationsList from './components/SimulationsList';
import { authService } from './services/authService';
import simulioLogo from './assets/Simulio-logo.svg';

function App() {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('clients'); // Changé de 'simulation' à 'clients'
  const [selectedClientForSimulation, setSelectedClientForSimulation] = useState(null);
  const [editingSimulation, setEditingSimulation] = useState(null);

  // Fonction pour lire les query parameters
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // Fonction pour mettre à jour l'URL avec les query parameters
  const updateURL = (tab) => {
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  // Fonction pour changer d'onglet
  const changeTab = (newTab) => {
    setActiveTab(newTab);
    updateURL(newTab);
  };

  useEffect(() => {
    const savedToken = authService.getToken();
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      
      // Lire l'onglet depuis l'URL ou utiliser 'clients' par défaut
      const tabFromURL = getQueryParam('tab');
      if (tabFromURL && ['simulation', 'clients', 'history'].includes(tabFromURL)) {
        setActiveTab(tabFromURL);
      } else {
        // Si pas d'onglet dans l'URL, mettre à jour l'URL avec 'clients'
        updateURL('clients');
      }
    }
  }, []);

  // Écouter les changements d'URL (bouton retour du navigateur)
  useEffect(() => {
    const handlePopState = () => {
      const tabFromURL = getQueryParam('tab');
      if (tabFromURL && ['simulation', 'clients', 'history'].includes(tabFromURL)) {
        setActiveTab(tabFromURL);
      } else {
        setActiveTab('clients');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogin = (newToken) => {
    authService.setToken(newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    setError('');
    // Rediriger vers clients après connexion
    changeTab('clients');
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setIsAuthenticated(false);
    setError('');
    // Nettoyer l'URL
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleTokenExpired = () => {
    setError('Votre session a expiré. Veuillez vous reconnecter.');
    handleLogout();
  };

  const handleClientCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSimulateClient = (client) => {
    setSelectedClientForSimulation(client);
    changeTab('simulation');
  };

  const handleEditSimulation = (simulation) => {
    setEditingSimulation(simulation);
    changeTab('simulation');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation moderne */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Simulio - Réduit sur mobile */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-16 sm:w-24 h-8 sm:h-12">
                <img 
                  src={simulioLogo} 
                  alt="Simulio" 
                  className="h-6 sm:h-10 w-auto"
                />
              </div>
            </div>
            
            {/* Navigation tabs - Responsive */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => changeTab('clients')}
                className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'clients'
                    ? 'bg-green-100 text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Clients</span>
              </button>
              <button
                onClick={() => changeTab('simulation')}
                className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'simulation'
                    ? 'bg-green-100 text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Simulateur</span>
              </button>
              <button
                onClick={() => changeTab('history')}
                className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-green-100 text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Historique</span>
              </button>
            </div>
            
            {/* Bouton déconnexion - Mobile friendly */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal - Padding mobile */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ClientForm 
              token={token} 
              onClientCreated={handleClientCreated}
              onTokenExpired={handleTokenExpired}
            />
            <ClientList 
              token={token} 
              refreshTrigger={refreshTrigger}
              onTokenExpired={handleTokenExpired}
              onSelectClient={handleSimulateClient}
            />
          </div>
        )}
        {activeTab === 'simulation' && (
          <SimulationForm 
            onTokenExpired={handleTokenExpired}
            preSelectedClient={selectedClientForSimulation}
            onClientUsed={() => setSelectedClientForSimulation(null)}
            editingSimulation={editingSimulation}
            setEditingSimulation={setEditingSimulation}
          />
        )}
        {activeTab === 'history' && (
          <SimulationsList 
            onTokenExpired={handleTokenExpired}
            onEditSimulation={handleEditSimulation}
          />
        )}
      </main>
    </div>
  );
}

export default App;
