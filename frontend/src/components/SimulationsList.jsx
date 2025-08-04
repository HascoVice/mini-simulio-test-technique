import { useState, useEffect } from 'react';
import { History, Calendar, Euro, User, Eye, X, Edit, Trash2 } from 'lucide-react';
import { authService } from '../services/authService';

const SimulationsList = ({ onTokenExpired, onEditSimulation }) => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // ✅ AJOUTER CETTE LIGNE
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [simulationToDelete, setSimulationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSimulations = async () => {
    try {
      const response = await authService.apiCall('http://localhost:9654/api/simulations/user');
      
      if (response.ok) {
        const data = await response.json();
        setSimulations(data);
        setError('');
      } else {
        setError('Erreur lors du chargement des simulations');
      }
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        onTokenExpired();
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  const handleViewDetails = async (simulation) => {
    try {
      const response = await authService.apiCall(`http://localhost:9654/api/simulations/${simulation.id}`);
      
      if (response.ok) {
        const detailedSimulation = await response.json();
        setSelectedSimulation(detailedSimulation);
        setShowModal(true);
      } else {
        setError('Impossible de récupérer les détails');
      }
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        onTokenExpired();
      } else {
        setError('Erreur de connexion');
      }
    }
  };

  const handleEditSimulation = (simulation) => {
    if (onEditSimulation) {
      onEditSimulation(simulation);
    }
  };

  const handleDeleteSimulation = async (simulation) => {
    setSimulationToDelete(simulation);
    setShowDeleteModal(true);
  };

  const confirmDeleteSimulation = async () => {
    if (!simulationToDelete) return;

    setDeleting(true);
    try {
      const response = await authService.apiCall(`http://localhost:9654/api/simulations/${simulationToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Simulation supprimée avec succès !');
        
        // ✅ Recharger la liste après suppression
        await fetchSimulations(); // ✅ Ajouter await pour être sûr
        
        setShowDeleteModal(false);
        setSimulationToDelete(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.msg || 'Erreur lors de la suppression');
      }
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        onTokenExpired();
      } else {
        setError('Erreur de connexion');
      }
    } finally {
      setDeleting(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Historique des simulations ({simulations.length})
          </h3>
        </div>

        {/* ✅ AJOUTER l'affichage du message de succès */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {simulations.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
              <History className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune simulation</h4>
            <p className="text-gray-500">Vous n'avez pas encore sauvegardé de simulation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {simulations.map((simulation) => (
              <div
                key={simulation.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200"
              >
                {/* Layout mobile : tout empilé verticalement */}
                <div className="flex flex-col space-y-3">
                  
                  {/* Informations principales */}
                  <div className="flex-1">
                    {/* Client info */}
                    <div className="flex items-start space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                          <span className="font-semibold text-gray-900">{simulation.client_name}</span>
                          <span className="text-sm text-gray-500 truncate">({simulation.client_email})</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Simulation details - Stack sur mobile, grid sur desktop */}
                    <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 text-sm mb-2">
                      <div className="flex items-center space-x-2">
                        <Euro className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-gray-600">Mensualité:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(Math.max(0, simulation.monthly_payment))}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Montant:</span>
                        <span className="font-semibold">
                          {formatCurrency(Math.max(0, simulation.amount))}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Durée:</span>
                        <span className="font-semibold">{simulation.duration} ans</span>
                      </div>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>Créée le {formatDate(simulation.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions - Rangée séparée sur mobile */}
                  <div className="border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:space-x-2 sm:justify-end">
                      <button 
                        onClick={() => handleViewDetails(simulation)}
                        className="flex items-center justify-center space-x-1 px-2 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden xs:inline sm:inline">Détails</span>
                      </button>
                      <button 
                        onClick={() => handleEditSimulation(simulation)}
                        className="flex items-center justify-center space-x-1 px-2 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden xs:inline sm:inline">Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSimulation(simulation)}
                        className="flex items-center justify-center space-x-1 px-2 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden xs:inline sm:inline">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showModal && selectedSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Détails de la simulation</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Info client */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Client</h4>
                <p className="text-blue-800">{selectedSimulation.client_name}</p>
                <p className="text-blue-600 text-sm">{selectedSimulation.client_email}</p>
              </div>

              {/* Détails financiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Paramètres du prêt</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix du bien:</span>
                      <span className="font-semibold">{formatCurrency(selectedSimulation.prix_bien || selectedSimulation.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Apport personnel:</span>
                      <span className="font-semibold">{formatCurrency(selectedSimulation.apport || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Travaux:</span>
                      <span className="font-semibold">{formatCurrency(selectedSimulation.travaux || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant financé:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(Math.max(0, selectedSimulation.montant_finance || selectedSimulation.amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span className="font-semibold">{selectedSimulation.duration} ans</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux d'intérêt:</span>
                      <span className="font-semibold">{selectedSimulation.interest_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taux d'assurance:</span>
                      <span className="font-semibold">{selectedSimulation.taux_assurance || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Résultats financiers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mensualité:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(Math.max(0, selectedSimulation.monthly_payment))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salaire minimum requis:</span>
                      <span className="font-semibold">{formatCurrency(Math.max(0, selectedSimulation.salaire_minimum || 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Intérêts totaux:</span>
                      <span className="font-semibold text-orange-600">{formatCurrency(Math.max(0, selectedSimulation.interets_totaux || 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assurance totale:</span>
                      <span className="font-semibold">{formatCurrency(Math.max(0, selectedSimulation.assurance_totale || 0))}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Frais annexes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais de notaire:</span>
                      <span className="font-semibold">{formatCurrency(selectedSimulation.frais_notaire || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais d'agence:</span>
                      <span className="font-semibold">{formatCurrency(selectedSimulation.frais_agence || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Garantie bancaire:</span>
                      <span className="font-semibold">{formatCurrency(selectedSimulation.garantie_bancaire || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Créé le:</span>
                    <span className="font-semibold">{formatDate(selectedSimulation.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && simulationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Supprimer la simulation</h3>
                  <p className="text-sm text-gray-600">Cette action est irréversible</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Simulation #{simulationToDelete.id}</strong>
                </p>
                <p className="text-sm text-red-700">
                  Client : {simulationToDelete.client_name}
                </p>
                <p className="text-sm text-red-700">
                  Mensualité : {formatCurrency(simulationToDelete.monthly_payment)}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSimulationToDelete(null);
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteSimulation}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimulationsList;