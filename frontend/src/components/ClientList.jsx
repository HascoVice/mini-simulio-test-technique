import { useState, useEffect } from 'react';
import { Users, RefreshCw, Mail, Phone, Calculator, Trash2 } from 'lucide-react'; // ❌ Supprimer Edit
import { authService } from '../services/authService';

const ClientsList = ({ token, refreshTrigger, onTokenExpired, onSelectClient }) => { // ❌ Supprimer onEditClient
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Ajouter cette ligne aussi
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClients = async () => {
    try {
      const response = await authService.apiCall('http://localhost:5000/api/clients/');

      if (response.ok) {
        const data = await response.json();
        setClients(data);
        setError('');
      } else {
        setError('Erreur lors du chargement des clients');
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
    fetchClients();
  }, [token, refreshTrigger]);

  const handleSimulateClick = (client) => {
    if (onSelectClient) {
      onSelectClient(client);
    }
  };

  const handleDeleteClient = async (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    setDeleting(true);
    try {
      const response = await authService.apiCall(`http://localhost:5000/api/clients/${clientToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Client supprimé avec succès !');
        fetchClients(); // Recharger la liste
        setShowDeleteModal(false);
        setClientToDelete(null);
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
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Mes clients ({clients.length})
          </h3>
        </div>
        <button
          onClick={fetchClients}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun client</h4>
          <p className="text-gray-500 mb-1">Vous n'avez pas encore créé de client.</p>
          <p className="text-sm text-gray-400">Utilisez le formulaire ci-dessus pour commencer !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              {/* Layout adapté pour éviter les chevauchements */}
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                
                {/* Section gauche : Avatar + Infos client */}
                <div className="flex-1 min-w-0">
                  {/* Ligne 1 : Avatar + Nom + Email */}
                  <div className="flex items-start space-x-3 mb-2">
                    <div className="flex-shrink-0">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {client.name}
                      </h4>
                      {/* Email aligné sous le nom */}
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ligne 2 : Téléphone avec marge gauche pour aligner avec l'email */}
                  {client.phone && (
                    <div className="ml-[51px]">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section droite : Actions (séparée sur mobile, alignée à droite sur desktop) */}
                <div className="border-t border-gray-100 pt-3 lg:border-t-0 lg:pt-0 lg:flex-shrink-0 lg:ml-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleSimulateClick(client)}
                      className="flex-1 lg:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-w-[80px]"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>Simuler</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClient(client)}
                      className="flex-1 lg:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors min-w-[80px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Affichage du message de succès */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mt-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Supprimer le client</h3>
                  <p className="text-sm text-gray-600">Cette action est irréversible</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Attention :</strong> Supprimer ce client supprimera également toutes ses simulations associées.
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Client : <strong>{clientToDelete.name}</strong> ({clientToDelete.email})
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setClientToDelete(null);
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteClient}
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
    </div>
  );
};

export default ClientsList;