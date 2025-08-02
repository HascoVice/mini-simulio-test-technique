import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const ClientList = ({ token, refreshTrigger, onTokenExpired }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Mes clients ({clients.length})
        </h3>
        <button
          onClick={fetchClients}
          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          Actualiser
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun client créé pour le moment.</p>
          <p className="text-sm">Créez votre premier client ci-dessus !</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    {client.phone && (
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      Simuler
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientList;