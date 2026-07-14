import { formatCurrency } from '@/utils/currencyUtils';
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    businessName: 'Gila House',
    email: 'gilahouse@resturnt.com',
    phone: '+91 12345 67890',
    address: 'Indonesia',
    currency: 'IDR (Rp)',
    taxRate: '18',
    invoicePrefix: 'INV-',
    motto: 'Serving Excellence',
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.success && response.data.data) {
        setSettings(prev => ({
          ...prev,
          ...response.data.data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await api.patch('/settings', newSettings);
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
