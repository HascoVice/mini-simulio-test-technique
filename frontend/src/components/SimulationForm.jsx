import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const SimulationForm = ({ onTokenExpired }) => {
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
        if (data.length > 0) {
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Simulateur de Crédit Immobilier
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire avec sliders */}
        <div className="space-y-6">
          {/* Sélection du client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prix du bien */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix du bien : {formatCurrency(simulation.prix_bien)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travaux : {formatCurrency(simulation.travaux)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée : {simulation.duree_annees} ans
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taux d'intérêt : {simulation.taux_interet}%
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apport : {formatCurrency(simulation.apport)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frais de notaire : {simulation.frais_notaire_pct}%
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

        {/* Résultats */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Résultats de la simulation</h3>
          
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Calcul en cours...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Mensualité principale */}
              <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800">Mensualité</h4>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(result.mensualite)}
                </p>
              </div>

              {/* Détails financiers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500">Montant financé</p>
                  <p className="font-semibold">{formatCurrency(result.montant_finance)}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500">Salaire minimum</p>
                  <p className="font-semibold">{formatCurrency(result.salaire_minimum)}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500">Intérêts totaux</p>
                  <p className="font-semibold">{formatCurrency(result.interets_totaux)}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500">Assurance totale</p>
                  <p className="font-semibold">{formatCurrency(result.assurance_totale)}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500">Frais de notaire</p>
                  <p className="font-semibold">{formatCurrency(result.frais_notaire)}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500">Garantie bancaire</p>
                  <p className="font-semibold">{formatCurrency(result.garantie_bancaire)}</p>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <button
                onClick={saveSimulation}
                disabled={saving || !selectedClient}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                {saving ? 'Sauvegarde...' : 'ENREGISTRER LA SIMULATION'}
              </button>
            </div>
          )}

          {/* Messages d'erreur et succès */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationForm;