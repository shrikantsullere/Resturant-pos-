import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('resto-customer-cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState(user || null);
  const [supportRequests, setSupportRequests] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/24', isDefault: true }
  ]);
  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Home', address: '123 Luxury Suite, Gila House', isDefault: true }
  ]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    orders: true, reservations: true, roomService: true, offers: false
  });
  const [systemSettings, setSystemSettings] = useState({
    theme: 'light', language: 'English', currency: 'USD'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
      fetchCustomerData();
    }
  }, [user]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const favsRes = await api.get('/customer/favorites').catch(() => ({ data: { data: [] } }));
      const supportRes = await api.get('/concierge/tickets').catch(() => ({ data: { data: [] } }));
      
      setFavorites(favsRes.data.data.map(f => f.menu_item_id));
      setSupportRequests(supportRes.data.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('resto-customer-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, size, quantity, notes) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.itemId === item.id && i.size === size.name && i.notes === notes);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        id: Date.now(),
        itemId: item.id,
        name: item.name,
        image: item.image,
        size: size.name,
        price: size.price,
        quantity,
        notes
      }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateCartQuantity = (id, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleFavorite = async (itemId) => {
    try {
      // Backend uses a single POST /favorites route to toggle
      await api.post('/customer/favorites', { itemId });
      
      setFavorites(prev => {
        if (prev.includes(itemId)) {
          return prev.filter(id => id !== itemId);
        } else {
          return [...prev, itemId];
        }
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const createSupportRequest = async (details) => {
    try {
      const response = await api.post('/concierge/tickets', details);
      const newReq = response.data.data;
      setSupportRequests(prev => [newReq, ...prev]);
      return newReq;
    } catch (error) {
      console.error('Error creating support request:', error);
      throw error;
    }
  };


  const updateProfile = async (newData) => {
    try {
      const response = await api.put('/customer/profile', newData);
      const updatedUser = response.data.data;
      
      // Update local context
      setProfile(updatedUser);
      
      // Sync with AuthContext and LocalStorage
      const fullUserData = { ...user, ...updatedUser };
      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  return (
    <CustomerContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateCartQuantity, clearCart,
      favorites, toggleFavorite,
      profile, updateProfile,
      paymentMethods, setPaymentMethods,
      addresses, setAddresses,
      notificationPrefs, setNotificationPrefs,
      systemSettings, setSystemSettings,
      supportRequests, createSupportRequest,
      loading
    }}>
      {children}
    </CustomerContext.Provider>
  );
};
