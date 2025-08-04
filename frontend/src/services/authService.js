const API_BASE_URL = 'http://localhost:9654/api';

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Fonction pour faire des requêtes avec gestion d'expiration
  apiCall: async (url, options = {}) => {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('NO_TOKEN');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...options, ...defaultOptions });

    // Si le token est expiré
    if (response.status === 401) {
      const data = await response.json();
      if (data.msg === 'Token expiré') {
        authService.logout();
        throw new Error('TOKEN_EXPIRED');
      }
    }

    return response;
  }
};