import { useState, useEffect } from 'react';
import { Calculator, Users, Euro, TrendingUp, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';

const SimulationForm = ({ onTokenExpired, preSelectedClient, onClientUsed }) => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [simulation, setSimulation] = useState({
    prix_bien: 834000,
    travaux: 20000,
    duree_annees: 25,
    taux_interet: 3.5,
    taux_assurance: 0.32,
    apport: 50000,
    frais_agence_pct: 3,
    frais_notaire_pct: 7.5,
    revalorisation_pct: 1
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les clients au démarrage
  useEffect(() => {
    fetchClients();
  }, []);

  // Gérer le client pré-sélectionné
  useEffect(() => {
    if (preSelectedClient && clients.length > 0) {
      setSelectedClient(preSelectedClient.id.toString());
      if (onClientUsed) {
        onClientUsed();
      }
    }
  }, [preSelectedClient, clients]);

  // Calculer automatiquement à chaque changement
  useEffect(() => {
    calculateSimulation();
  }, [simulation]);

  const fetchClients = async () => {
    try {
      const response = await authService.apiCall('http://localhost:5000/api/clients/');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
        if (data.length > 0 && !selectedClient) {
          setSelectedClient(data[0].id);
        }
      }
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        onTokenExpired();
      }
    }
  };

  const calculateSimulation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.apiCall('http://localhost:5000/api/simulations/calculate-simple', {
        method: 'POST',
        body: JSON.stringify({
          ...simulation,
          mois: '02',
          annee: '2025'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Erreur de calcul');
      }
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        onTokenExpired();
      } else {
        setError('Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field, value) => {
    setSimulation(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  };

  const saveSimulation = async () => {
    if (!selectedClient) {
      setError('Veuillez sélectionner un client');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.apiCall('http://localhost:5000/api/simulations/save', {
        method: 'POST',
        body: JSON.stringify({
          client_id: parseInt(selectedClient),
          ...simulation,
          mois: '02',
          annee: '2025'
        }),
      });

      if (response.ok) {
        setSuccess('Simulation sauvegardée avec succès !');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Erreur de sauvegarde');
      }
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        onTokenExpired();
      } else {
        setError('Erreur de connexion');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            <Calculator className="w-4 h-4 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Simulateur de Crédit Immobilier</h2>
        </div>
        <p className="text-gray-600">Ajustez les paramètres pour calculer votre simulation en temps réel</p>
        {preSelectedClient && (
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Client sélectionné :</strong> {preSelectedClient.name} ({preSelectedClient.email})
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Paramètres de simulation */}
        <div className="xl:col-span-2 space-y-6">
          {/* Sélection du client */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-lg">
                <Users className="w-3 h-3 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Client</h3>
            </div>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-lg">
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Paramètres du projet</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prix du bien */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Prix du bien : <span className="text-green-600">{formatCurrency(simulation.prix_bien)}</span>
                </label>
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="10000"
                  value={simulation.prix_bien}
                  onChange={(e) => handleSliderChange('prix_bien', e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100k€</span>
                  <span>2M€</span>
                </div>
              </div>

              {/* Travaux */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Travaux : <span className="text-green-600">{formatCurrency(simulation.travaux)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={simulation.travaux}
                  onChange={(e) => handleSliderChange('travaux', e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0€</span>
                  <span>200k€</span>
                </div>
              </div>

              {/* Durée */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Durée : <span className="text-green-600">{simulation.duree_annees} ans</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={simulation.duree_annees}
                  onChange={(e) => handleSliderChange('duree_annees', e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10 ans</span>
                  <span>30 ans</span>
                </div>
              </div>

              {/* Taux d'intérêt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Taux d'intérêt : <span className="text-green-600">{simulation.taux_interet}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.1"
                  value={simulation.taux_interet}
                  onChange={(e) => handleSliderChange('taux_interet', e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-red"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1%</span>
                  <span>8%</span>
                </div>
              </div>

              {/* Apport */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Apport : <span className="text-green-600">{formatCurrency(simulation.apport)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={simulation.apport}
                  onChange={(e) => handleSliderChange('apport', e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-yellow"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0€</span>
                  <span>500k€</span>
                </div>
              </div>

              {/* Frais de notaire */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Frais de notaire : <span className="text-green-600">{simulation.frais_notaire_pct}%</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="0.5"
                  value={simulation.frais_notaire_pct}
                  onChange={(e) => handleSliderChange('frais_notaire_pct', e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-indigo"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2%</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-lg">
              <Euro className="w-3 h-3 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Résultats</h3>
          </div>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-3">Calcul en cours...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Mensualité principale */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 text-sm mb-1">Mensualité</h4>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(result.mensualite)}
                </p>
              </div>

              {/* Détails */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Montant financé</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(result.montant_finance)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Salaire minimum</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(result.salaire_minimum)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Intérêts totaux</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(result.interets_totaux)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Assurance totale</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(result.assurance_totale)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Frais de notaire</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(result.frais_notaire)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-600">Garantie bancaire</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(result.garantie_bancaire)}</span>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <button
                onClick={saveSimulation}
                disabled={saving || !selectedClient}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    ENREGISTRER LA SIMULATION
                  </>
                )}
              </button>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationForm;