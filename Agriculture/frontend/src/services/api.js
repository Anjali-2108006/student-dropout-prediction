/**
 * AgriLink Centralized API Client Service
 * Bridges React Frontend components with Express Node.js Backend & MongoDB API.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic API request wrapper handling headers, JSON serialization, and friendly network error messages.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.message || `HTTP Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to AgriLink server. Please make sure the backend is running at http://localhost:5000');
    }
    throw error;
  }
}

// Generic CRUD Helper Functions
export const apiGet = (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `${endpoint}?${queryString}` : endpoint;
  return request(path, { method: 'GET' });
};

export const apiPost = (endpoint, body) => request(endpoint, { method: 'POST', body });
export const apiPut = (endpoint, body) => request(endpoint, { method: 'PUT', body });
export const apiDelete = (endpoint) => request(endpoint, { method: 'DELETE' });

// Resource-Specific API Functions

/** Health check */
export const getHealth = () => apiGet('/health');

/** Market Prices API */
export const getMarketPrices = (params = {}) => apiGet('/market-prices', params);

/** Buyer Demands API */
export const getBuyerDemands = (params = {}) => apiGet('/buyer-demands', params);
export const createBuyerDemand = (data) => apiPost('/buyer-demands', data);

/** Lots API */
export const getLots = (params = {}) => apiGet('/lots', params);
export const getLotById = (id) => apiGet(`/lots/${id}`);
export const createLot = (data) => apiPost('/lots', data);
export const updateLot = (id, data) => apiPut(`/lots/${id}`, data);

/** Offers API */
export const getOffers = (params = {}) => apiGet('/offers', params);
export const getOfferById = (id) => apiGet(`/offers/${id}`);
export const createOffer = (data) => apiPost('/offers', data);
export const updateOffer = (id, data) => apiPut(`/offers/${id}`, data);
export const updateOfferStatus = (id, status) => apiPut(`/offers/${id}`, { status });

/** Transactions API */
export const getTransactions = (params = {}) => apiGet('/transactions', params);
export const getTransactionById = (id) => apiGet(`/transactions/${id}`);
export const createTransaction = (data) => apiPost('/transactions', data);
export const updateTransaction = (id, data) => apiPut(`/transactions/${id}`, data);
export const deleteTransaction = (id) => apiDelete(`/transactions/${id}`);

/** Logistics API */
export const getLogistics = (params = {}) => apiGet('/logistics', params);
export const getLogisticsById = (id) => apiGet(`/logistics/${id}`);
export const createLogistics = (data) => apiPost('/logistics', data);
export const updateLogistics = (id, data) => apiPut(`/logistics/${id}`, data);
export const deleteLogistics = (id) => apiDelete(`/logistics/${id}`);

/** Grievances API */
export const getGrievances = (params = {}) => apiGet('/grievances', params);
export const getGrievanceById = (id) => apiGet(`/grievances/${id}`);
export const createGrievance = (data) => apiPost('/grievances', data);
export const updateGrievance = (id, data) => apiPut(`/grievances/${id}`, data);
export const updateGrievanceStatus = (id, data) => apiPut(`/grievances/${id}`, data);
export const deleteGrievance = (id) => apiDelete(`/grievances/${id}`);

/** Users API */
export const getUsers = (params = {}) => apiGet('/users', params);
export const getUserById = (id) => apiGet(`/users/${id}`);
export const createUser = (data) => apiPost('/users', data);
export const updateUser = (id, data) => apiPut(`/users/${id}`, data);
export const deleteUser = (id) => apiDelete(`/users/${id}`);

/** Admin Analytics API */
export const getAdminStats = () => apiGet('/admin/stats');
export const getAdminMarketAnalytics = () => apiGet('/admin/analytics/markets');
export const getAdminTransactionAnalytics = () => apiGet('/admin/analytics/transactions');
export const getAdminLogisticsAnalytics = () => apiGet('/admin/analytics/logistics');
export const getAdminGrievanceAnalytics = () => apiGet('/admin/analytics/grievances');
export const getAdminActivity = () => apiGet('/admin/activity');

/** Market Intelligence API */
export const getMarketIntelligence = (params = {}) => apiGet('/market-intelligence', params);
export const getMarketForecast = (params = {}) => apiGet('/market-intelligence/forecast', params);
