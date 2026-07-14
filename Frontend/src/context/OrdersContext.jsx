import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '@/utils/api';
import { io } from 'socket.io-client';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import socketService from '@/sockets/socket.service';

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const params = {};
      const userRole = String(typeof user.role === 'object' ? user.role?.role_name || '' : (user.role || user.role_name || '')).toUpperCase();
      
      // If customer, only show their orders. If admin/staff, show all.
      if (userRole === 'CUSTOMER') {
        params.userId = user.id;
      }

      const response = await api.get('/orders', { params });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchOrders();

    const handleNewOrder = (order) => {
      setOrders(prev => [order, ...prev]);
      
      if (user?.role_name === 'chef') {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance("New order is coming");
          window.speechSynthesis.speak(utterance);
        }
      }

      addNotification({
        type: 'Kitchen',
        title: 'New Customer Order',
        message: `Order #${order.id} received.`,
        targetRole: 'STAFF'
      });
    };

    const handleStatusUpdate = (data) => {
      // Backend sends { id, status }, map it to the orders state
      const orderId = String(data.id || data.order_id);
      setOrders(prev => prev.map(o => String(o.id) === orderId ? { ...o, order_status: data.status } : o));
    };

    socketService.on('new_order', handleNewOrder);
    socketService.on('order_update', handleStatusUpdate);
    socketService.on('order_status_updated', handleStatusUpdate);

    return () => {
      socketService.off('new_order');
      socketService.off('order_status_updated');
    };
  }, [user, addNotification, fetchOrders]);

  const addOrder = async (cartItems, extraData = {}) => {
    try {
      const subtotal = cartItems.reduce((acc, i) => acc + (i.price * (i.qty || i.quantity || 0)), 0);
      const tax = extraData.tax || subtotal * 0.05;
      const total = extraData.total || (subtotal + tax + (extraData.serviceFee || 0));

      const orderData = {
        order_number: `ORD-${Date.now()}`,
        subtotal: subtotal,
        tax: tax,
        discount: extraData.discount || 0,
        serviceChargePercent: extraData.serviceChargePercent || 0,
        service_charge_percent: extraData.serviceChargePercent || 0,
        serviceChargeAmount: extraData.serviceChargeAmount || 0,
        service_charge_amount: extraData.serviceChargeAmount || 0,
        grand_total: total,
        order_type: extraData.type?.toLowerCase() || 'dine-in',
        table_id: extraData.tableId || null,
        customer_id: extraData.customerId || null,
        user_id: extraData.userId || null,
        payment_status: extraData.paymentStatus || 'pending',
        payment_method: extraData.paymentMethod || null,
        order_status: 'new'
      };

      const items = cartItems.map(item => ({
        menu_item_id: item.itemId || item.id,
        quantity: item.qty || item.quantity,
        unit_price: item.price,
        total_price: item.price * (item.qty || item.quantity)
      }));

      const response = await api.post('/orders', { orderData, items });
      fetchOrders(); // Refresh list
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    // Optimistic UI update
    const previousOrders = [...orders];
    const normalizedStatus = status.toLowerCase();
    
    setOrders(prev => prev.map(o => 
      String(o.id) === String(orderId) ? { ...o, order_status: normalizedStatus } : o
    ));

    try {
      await api.patch(`/orders/${orderId}/status`, { status: normalizedStatus });
      addNotification({
        type: 'Order',
        title: 'Status Updated',
        message: `Order #${orderId} is now ${status}`,
        targetRole: 'WAITER'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      // Rollback on error
      setOrders(previousOrders);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
      setOrders(prev => prev.map(o => 
        String(o.id) === String(orderId) ? { ...o, order_status: 'cancelled' } : o
      ));
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  return (
    <OrdersContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus, 
      cancelOrder,
      loading,
      refreshOrders: fetchOrders 
    }}>
      {children}
    </OrdersContext.Provider>
  );
};
