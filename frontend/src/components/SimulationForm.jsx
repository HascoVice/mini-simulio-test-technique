import { useState, useEffect } from 'react';
import { Calculator, Users, Euro, TrendingUp, Save, AlertCircle, CheckCircle, X } from 'lucide-react';
import { authService } from '../services/authService';
import SliderInput from './SliderInput';

const SimulationForm = ({ onTokenExpired, preSelectedClient, onClientUsed, editingSimulation, setEditingSimulation }) => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  
  // Valeurs de base minimales
  const getDefaultSimulation = () => ({
    prix_bien: 100000,
    travaux: 0,
    duree_annees: 10,
    taux_interet: 1,
    taux_assurance: 0.1,
    apport: 0,
    frais_agence_pct: 0,
    frais_notaire_pct: 2,
    revalorisation_pct: 0
  });

  const [simulation, setSimulation] = useState(getDefaultSimulation());
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
      resetSimulation();
      if (onClientUsed) {
        onClientUsed();
      }
    }
  }, [preSelectedClient, clients]);

  // Calculer automatiquement à chaque changement
  useEffect(() => {
    if (selectedClient) {
      calculateSimulation();
    }
  }, [simulation, selectedClient]);

  // Gérer la simulation en cours de modification
  useEffect(() => {
    if (editingSimulation) {
      console.log('Mode édition activé:', editingSimulation);
      setSimulation({
        prix_bien: editingSimulation.prix_bien || 100000,
        travaux: editingSimulation.travaux || 0,
        duree_annees: editingSimulation.duration || 10,
        taux_interet: editingSimulation.interest_rate || 1,
        taux_assurance: editingSimulation.taux_assurance || 0.1,
        apport: editingSimulation.apport || 0,
        frais_agence_pct: editingSimulation.frais_agence_pct || 0,
        frais_notaire_pct: editingSimulation.frais_notaire_pct || 2,
        revalorisation_pct: 0
      });
      setSelectedClient(editingSimulation.client_id?.toString() || '');
    }
  }, [editingSimulation]);

  // Fonction pour reset la simulation aux valeurs minimales
  const resetSimulation = () => {
    setSimulation(getDefaultSimulation());
    setResult(null);
    setError('');
    setSuccess('');
  };

  const fetchClients = async () => {
    try {
      const response = await authService.apiCall('http://localhost:5000/api/clients/');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        onTokenExpired();
      }
    }
  };

  const calculateSimulation = async () => {
    if (!selectedClient) return;
    
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
        setSuccess('🎉 Simulation sauvegardée avec succès ! Rendez-vous dans l\'onglet "Historique" pour retrouver toutes vos simulations.');
        setTimeout(() => setSuccess(''), 5000); // Plus long pour laisser le temps de lire
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

  // FONCTION DE MISE À JOUR
  const updateSimulation = async () => {
    if (!selectedClient) {
      setError('Veuillez sélectionner un client');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('Mise à jour simulation:', editingSimulation.id);
      const response = await authService.apiCall(`http://localhost:5000/api/simulations/${editingSimulation.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          client_id: parseInt(selectedClient),
          ...simulation,
          mois: '02',
          annee: '2025'
        }),
      });

      if (response.ok) {
        setSuccess('🔄 Simulation mise à jour ! Consultez l\'onglet "Historique" pour voir les modifications appliquées.');
        setTimeout(() => {
          setSuccess('');
          setEditingSimulation(null);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Erreur de mise à jour');
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
      {/* Header avec indicateur de mode */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            <Calculator className="w-4 h-4 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {editingSimulation ? 'Modifier la simulation' : 'Simulateur de Crédit Immobilier'}
          </h2>
        </div>
        <p className="text-gray-600">
          {editingSimulation ? 'Modifiez les paramètres et recalculez' : 'Ajustez les paramètres pour calculer votre simulation en temps réel'}
        </p>
        {editingSimulation && (
          <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>Mode édition :</strong> Simulation #{editingSimulation.id} 
              {editingSimulation.client_name && ` - ${editingSimulation.client_name}`}
            </p>
          </div>
        )}
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
          {/* Sélection du client - Verrouillé en mode édition */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-5 sm:w-6 h-5 sm:h-6 bg-blue-100 rounded-lg">
                <Users className="w-3 h-3 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {editingSimulation ? 'Client de la simulation' : 'Client'}
              </h3>
              {editingSimulation && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  🔒 Verrouillé
                </span>
              )}
            </div>
            
            {editingSimulation ? (
              // Mode édition : affichage du client verrouillé
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {clients.find(c => c.id == selectedClient)?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {clients.find(c => c.id == selectedClient)?.name || 'Client inconnu'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {clients.find(c => c.id == selectedClient)?.email || ''}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Le client ne peut pas être modifié lors de l'édition d'une simulation existante
                </p>
              </div>
            ) : (
              // Mode création : sélection normale
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tous les sliders... (code existant) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-lg">
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Paramètres du projet</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prix du bien - Style d'origine */}
              <SliderInput
                label="Prix du bien"
                value={simulation.prix_bien}
                onChange={(value) => handleSliderChange('prix_bien', value)}
                min={100000}
                max={2000000}
                step={10000}
                unit="€"
                sliderClass="slider-blue"
                inputWidth="w-20"
                formatValue={formatCurrency}
                minLabel="100k€"
                maxLabel="2M€"
              />

              {/* Travaux - Style d'origine */}
              <SliderInput
                label="Travaux"
                value={simulation.travaux}
                onChange={(value) => handleSliderChange('travaux', value)}
                min={0}
                max={200000}
                step={5000}
                unit="€"
                sliderClass="slider-green"
                inputWidth="w-20"
                formatValue={formatCurrency}
                minLabel="0€"
                maxLabel="200k€"
              />

              {/* Durée - Style d'origine */}
              <SliderInput
                label="Durée"
                value={simulation.duree_annees}
                onChange={(value) => handleSliderChange('duree_annees', value)}
                min={10}
                max={30}
                step={1}
                unit="ans"
                sliderClass="slider-purple"
                inputWidth="w-20"
                minLabel="10 ans"
                maxLabel="30 ans"
              />

              {/* Taux d'intérêt - Style d'origine */}
              <SliderInput
                label="Taux d'intérêt"
                value={simulation.taux_interet}
                onChange={(value) => handleSliderChange('taux_interet', value)}
                min={1}
                max={8}
                step={0.1}
                unit="%"
                sliderClass="slider-red"
                inputWidth="w-20"
                minLabel="1%"
                maxLabel="8%"
              />

              {/* Taux d'assurance - Style d'origine */}
              <SliderInput
                label="Taux d'assurance"
                value={simulation.taux_assurance}
                onChange={(value) => handleSliderChange('taux_assurance', value)}
                min={0.1}
                max={1}
                step={0.05}
                unit="%"
                sliderClass="slider-orange"
                inputWidth="w-20"
                formatValue={(value) => `${value}%`}
                minLabel="0.1%"
                maxLabel="1%"
              />

              {/* Apport - Style d'origine */}
              <SliderInput
                label="Apport"
                value={simulation.apport}
                onChange={(value) => handleSliderChange('apport', value)}
                min={0}
                max={500000}
                step={5000}
                unit="€"
                sliderClass="slider-yellow"
                inputWidth="w-20"
                formatValue={formatCurrency}
                minLabel="0€"
                maxLabel="500k€"
              />

              {/* Frais de notaire - Style d'origine */}
              <SliderInput
                label="Frais de notaire"
                value={simulation.frais_notaire_pct}
                onChange={(value) => handleSliderChange('frais_notaire_pct', value)}
                min={2}
                max={10}
                step={0.5}
                unit="%"
                sliderClass="slider-indigo"
                inputWidth="w-20"
                minLabel="2%"
                maxLabel="10%"
              />

              {/* Frais d'agence - Style d'origine */}
              <SliderInput
                label="Frais d'agence"
                value={simulation.frais_agence_pct}
                onChange={(value) => handleSliderChange('frais_agence_pct', value)}
                min={0}
                max={8}
                step={0.5}
                unit="%"
                sliderClass="slider-pink"
                inputWidth="w-20"
                minLabel="0%"
                maxLabel="8%"
              />
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col min-h-[600px]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-lg">
              <Euro className="w-3 h-3 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Résultats</h3>
          </div>
          
          {/* Contenu principal - prend l'espace disponible */}
          <div className="flex-1 flex flex-col">
            {/* Message quand aucun client n'est sélectionné */}
            {!selectedClient && !loading && (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                    👤 Sélectionnez un client
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Choisissez un client dans la liste pour commencer à calculer votre simulation de crédit immobilier
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-3">Calcul en cours...</p>
                </div>
              </div>
            )}

            {result && !loading && selectedClient && (
              <div className="flex flex-col flex-1">
                {/* Résultats - prennent l'espace disponible */}
                <div className="flex-1 space-y-4 mb-6">
                  {/* Mensualité principale */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 text-sm mb-1">Mensualité</h4>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(Math.max(0, result.mensualite))}
                    </p>
                  </div>

                  {/* Détails */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Montant financé</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(Math.max(0, result.montant_finance))}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Salaire minimum</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(Math.max(0, result.salaire_minimum))}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Intérêts totaux</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(Math.max(0, result.interets_totaux))}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Assurance totale</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(Math.max(0, result.assurance_totale))}</span>
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
                </div>

                {/* Boutons - toujours en bas */}
                <div className="space-y-3 mt-auto">
                  {/* Bouton de sauvegarde/mise à jour */}
                  <button
                    onClick={editingSimulation ? updateSimulation : saveSimulation}
                    disabled={saving || !selectedClient}
                    className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingSimulation ? 'Mise à jour...' : 'Sauvegarde...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingSimulation ? 'METTRE À JOUR LA SIMULATION' : 'ENREGISTRER LA SIMULATION'}
                      </>
                    )}
                  </button>

                  {/* Bouton d'annulation - Affiché seulement en mode édition */}
                  {editingSimulation && (
                    <button
                      onClick={() => {
                        setEditingSimulation(null);
                        resetSimulation();
                        setSelectedClient('');
                        setResult(null);
                        setError('');
                        setSuccess('');
                      }}
                      disabled={saving}
                      className="w-full flex justify-center items-center py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      ANNULER LA MODIFICATION
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages d'erreur et succès - en bas mais avant les boutons */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-start space-x-2 mt-4">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg flex items-center space-x-2 mt-4">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationForm;
