import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';

const MenuContext = createContext();

export const categoryIconMap = {
  pizza: '🍕',
  burger: '🍔',
  drink: '🥤',
  beverage: '🥤',
  coffee: '☕',
  dessert: '🍰',
  cake: '🍰',
  side: '🍟',
  fry: '🍟',
  salad: '🥗',
  pasta: '🍝',
  chicken: '🍗',
  icecream: '🍨',
  breakfast: '🍳',
  egg: '🍳',
  indian: '🍛',
  curry: '🍛',
  chinese: '🍜',
  noodle: '🍜',
  bakery: '🥐',
  bread: '🥐',
  sandwich: '🥪',
  soup: '🥣',
  steak: '🥩',
  fish: '🐟',
  sushi: '🍣'
};

export const MenuProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['All Items']);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/menu/items'),
        api.get('/menu/categories')
      ]);
      
      const mappedItems = itemsRes.data.data.map(item => ({
        ...item,
        name: item.item_name || item.name,
        category: item.category_name || item.category
      }));
      
      setItems(mappedItems);
      setCategories(catsRes.data.data);
      
      // Update categories names list for UI filters
      const uniqueCategories = ['All Items', ...new Set(catsRes.data.data.map(c => c.category_name))];
      setCategoriesList(uniqueCategories);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (newItem) => {
    try {
      const response = await api.post('/menu/items', newItem);
      await fetchItems();
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error adding item:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to add item' };
    }
  };

  const updateItem = async (id, data) => {
    try {
      await api.patch(`/menu/items/${id}`, data);
      await fetchItems();
      return { success: true };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update item' };
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/menu/items/${id}`);
      await fetchItems();
      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete item' };
    }
  };

  return (
    <MenuContext.Provider value={{ items, categories, categoriesList, addItem, updateItem, deleteItem, loading, refreshMenu: fetchItems }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
