import { useMemo, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function useInvoiceApi() {
  const { getToken } = useAuth();

  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    try {
      const token = await getToken();
      
      const headers = {
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // If the body is NOT FormData, default to application/json
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Attempt to parse error message from server
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { message: 'HTTP error ' + response.status };
        }
        throw new Error(errData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`API Call failed at ${endpoint}:`, err);
      throw err;
    }
  }, [getToken]);

  return useMemo(() => ({
    // Invoices List & Search
    getInvoices: async (search = '', status = '') => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const query = params.toString() ? `?${params.toString()}` : '';
      return fetchWithAuth(`/invoices${query}`);
    },

    // Get Single Invoice
    getInvoice: async (id) => {
      return fetchWithAuth(`/invoices/${id}`);
    },

    // Create Invoice (supports JSON or FormData)
    createInvoice: async (data) => {
      const isFormData = data instanceof FormData;
      return fetchWithAuth('/invoices', {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
      });
    },

    // Update Invoice (supports JSON or FormData)
    updateInvoice: async (id, data) => {
      const isFormData = data instanceof FormData;
      return fetchWithAuth(`/invoices/${id}`, {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
      });
    },

    // Delete Invoice
    deleteInvoice: async (id) => {
      return fetchWithAuth(`/invoices/${id}`, {
        method: 'DELETE',
      });
    },

    // Get Business Profile
    getProfile: async () => {
      return fetchWithAuth('/businessProfile/me');
    },

    // Create Business Profile (supports JSON or FormData)
    createProfile: async (data) => {
      const isFormData = data instanceof FormData;
      return fetchWithAuth('/businessProfile', {
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
      });
    },

    // Update Business Profile (supports JSON or FormData)
    updateProfile: async (id, data) => {
      const isFormData = data instanceof FormData;
      return fetchWithAuth(`/businessProfile/${id}`, {
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
      });
    },

    // Generate Invoice Data from Natural Language via Gemini
    generateInvoiceData: async (prompt) => {
      return fetchWithAuth('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
    },
  }), [fetchWithAuth]);
}
