import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import socketService from '../services/socket';

const HospitalityContext = createContext();

export const useHospitality = () => {
  const context = useContext(HospitalityContext);
  if (!context) {
    throw new Error('useHospitality must be used within a HospitalityProvider');
  }
  return context;
};

export const HospitalityProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [folios, setFolios] = useState([]);
  const [staff, setStaff] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Ref to track active fetch to prevent duplicate concurrent requests
  const isFetching = useRef(false);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user || (isFetching.current && !isRefresh)) return;

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    isFetching.current = true;
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const userRole = String(typeof user.role === 'object' ? user.role?.role_name || '' : (user.role || user.role_name || '')).toUpperCase();
      const isStaff = ['ADMIN', 'MANAGER', 'CASHIER', 'WAITER'].includes(userRole);

      const endpoints = [
        { key: 'rooms', url: '/rooms' },
        { key: 'tables', url: '/tables' },
        { key: 'reservations', url: '/reservations' },
        { key: 'staff', url: '/staff' },
        { key: 'tasks', url: '/tasks' },
        { key: 'inventory', url: '/inventory' },
        { key: 'services', url: '/services' },
        { key: 'bookings', url: '/service-bookings' }
      ];

      if (isStaff) {
        endpoints.push({ key: 'billing', url: '/billing' });
      }

      const results = await Promise.allSettled(
        endpoints.map(endpoint => api.get(endpoint.url, { signal: abortControllerRef.current.signal }))
      );

      results.forEach((result, index) => {
        const { key } = endpoints[index];
        if (result.status === 'fulfilled') {
          const data = result.value.data.data;
          switch (key) {
            case 'rooms': setRooms(data || []); break;
            case 'tables': setTables(data || []); break;
            case 'reservations': setReservations(data || []); break;
            case 'staff': setStaff(data || []); break;
            case 'tasks': setTasks(data || []); break;
            case 'inventory': setInventory(data || []); break;
            case 'services': setServices(data || []); break;
            case 'bookings': setServiceBookings(data || []); break;
            case 'billing': setFolios(data || []); break;
            default: break;
          }
        } else if (result.reason.name !== 'CanceledError') {
          console.error(`Error fetching ${key}:`, result.reason);
        }
      });

    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.message);
        console.error('Hospitality fetch error:', err);
      }
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, [user]);

  const fetchActivityLogs = useCallback(async () => {
    // Only admin/manager can access this endpoint — skip for other roles
    const userRole = String(
      typeof user?.role === 'object'
        ? user?.role?.role_name || ''
        : (user?.role || user?.role_name || '')
    ).toLowerCase();
    if (!['admin', 'manager'].includes(userRole)) return;

    try {
      const res = await api.get('/dashboard/activity-logs?limit=20');
      const logs = res.data.data || [];
      setActivityLog(logs.map(l => ({
        id: l.id,
        message: l.message,
        type: l.type,
        entity_type: l.entity_type,
        entity_id: l.entity_id,
        time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawTime: l.created_at
      })));
    } catch (err) {
      // Silently skip — 403 or network errors should not affect the app
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.warn('Activity logs fetch error:', err.message);
      }
    }
  }, [user]);

  const addActivity = useCallback((message, type = 'info') => {
    // Immediately add optimistic entry, then sync from server
    setActivityLog(prev => [{ id: Date.now(), message, time: 'Just now', type }, ...prev].slice(0, 20));
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  useEffect(() => {
    fetchData();
    fetchActivityLogs();
    
    // Socket listeners for real-time updates
    const handleTableUpdate = (data) => {
      console.log('🔄 Socket: Table status update received', data);
      fetchData(true);
    };

    const handleNewReservation = (data) => {
      console.log('🔄 Socket: New reservation received', data);
      fetchData(true);
      addActivity(`New ${data.type || 'reservation'} received`, 'info');
    };

    const handleActivityLogUpdate = () => {
      fetchActivityLogs();
    };

    socketService.on('table_status_update', handleTableUpdate);
    socketService.on('new_reservation', handleNewReservation);
    socketService.on('reservation_update', handleTableUpdate);
    socketService.on('activity_log_update', handleActivityLogUpdate);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      socketService.off('table_status_update', handleTableUpdate);
      socketService.off('new_reservation', handleNewReservation);
      socketService.off('reservation_update', handleTableUpdate);
      socketService.off('activity_log_update', handleActivityLogUpdate);
    };
  }, [fetchData, fetchActivityLogs, addActivity]);

  // API Mutators wrapped in useCallback
  const updateRoomStatus = useCallback(async (id, status) => {
    try {
      await api.patch(`/rooms/${id}/status`, { status: status.toLowerCase() });
      await fetchData(true);
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  }, [fetchData]);

  const updateRoom = useCallback(async (id, data) => {
    try {
      await api.patch(`/rooms/${id}`, data);
      await fetchData(true);
      addActivity(`Room details updated for ID: ${id}`, 'info');
    } catch (error) {
      console.error('Error updating room:', error);
    }
  }, [fetchData, addActivity]);

  const addRoom = useCallback(async (roomData) => {
    try {
      await api.post('/rooms', roomData);
      await fetchData(true);
    } catch (error) {
      console.error('Error adding room:', error);
    }
  }, [fetchData]);

  const deleteRoom = useCallback(async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      await fetchData(true);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  }, [fetchData]);

  const approveReservation = useCallback(async (id) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status: 'confirmed' });
      await fetchData(true);
      addActivity('Reservation confirmed', 'success');
    } catch (error) {
      console.error('Error approving reservation:', error);
    }
  }, [fetchData, addActivity]);

  const checkInReservation = useCallback(async (id) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status: 'checked_in' });
      await fetchData(true);
      addActivity('Guest checked in', 'success');
    } catch (error) {
      console.error('Error checking in guest:', error);
    }
  }, [fetchData, addActivity]);

  const rejectReservation = useCallback(async (id) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status: 'cancelled' });
      await fetchData(true);
      addActivity('Reservation rejected', 'warning');
    } catch (error) {
      console.error('Error rejecting reservation:', error);
    }
  }, [fetchData, addActivity]);

  const completeReservation = useCallback(async (id) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status: 'completed' });
      await fetchData(true);
      addActivity('Reservation completed', 'success');
    } catch (error) {
      console.error('Error completing reservation:', error);
    }
  }, [fetchData, addActivity]);

  const cancelReservation = useCallback(async (id) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status: 'cancelled' });
      await fetchData(true);
      addActivity('Reservation cancelled', 'warning');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  }, [fetchData, addActivity]);

  const deleteReservation = useCallback(async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      await fetchData(true);
      addActivity('Reservation record deleted', 'danger');
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  }, [fetchData, addActivity]);

  const addReservation = useCallback(async (resData) => {
    try {
      await api.post('/reservations', resData);
      await fetchData(true);
      addActivity('New reservation added', 'success');
    } catch (error) {
      console.error('Error adding reservation:', error);
    }
  }, [fetchData, addActivity]);

  const addTable = useCallback(async (tableData) => {
    try {
      await api.post('/tables', tableData);
      await fetchData(true);
      addActivity(`New table registered: ${tableData.name}`, 'success');
    } catch (error) {
      console.error('Error adding table:', error);
    }
  }, [fetchData, addActivity]);

  const updateTableStatus = useCallback(async (id, status, extraData = null) => {
    try {
      await api.patch(`/tables/${id}/status`, { status, ...extraData });
      await fetchData(true);
      addActivity(`Table status updated to ${status}`, 'info');
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  }, [fetchData, addActivity]);

  const deleteTable = useCallback(async (id) => {
    try {
      await api.delete(`/tables/${id}`);
      await fetchData(true);
      addActivity('Table removed from floor plan', 'warning');
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  }, [fetchData, addActivity]);

  const addToFolio = useCallback(async (guestId, transaction) => {
    try {
      await api.post(`/billing/${guestId}/charges`, transaction);
      addActivity(`Charge added to folio: ${transaction.description}`, 'info');
      await fetchData(true);
    } catch (error) {
      console.error('Error adding to folio:', error);
    }
  }, [addActivity, fetchData]);

  const settleFolio = useCallback(async (id) => {
    try {
      await api.post(`/billing/${id}/settle`, {});
      await fetchData(true);
      addActivity(`Folio settled and closed`, 'success');
    } catch (error) {
      console.error('Error settling folio:', error);
    }
  }, [fetchData, addActivity]);

  const addTask = useCallback(async (task) => {
    try {
      await api.post('/tasks', task);
      await fetchData(true);
      addActivity(`Task assigned: ${task.title}`, 'info');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }, [fetchData, addActivity]);

  const updateTaskStatus = useCallback(async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      await fetchData(true);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }, [fetchData]);

  const addStaff = useCallback(async (staffData) => {
    try {
      const payload = {
        full_name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        role_name: staffData.role,
        shift: staffData.shift,
        status: staffData.status,
        password: staffData.password
      };
      await api.post('/staff', payload);
      await fetchData(true);
      addActivity(`New staff member added: ${staffData.name}`, 'success');
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  }, [fetchData, addActivity]);

  const updateStaff = useCallback(async (id, staffData) => {
    try {
      const payload = {
        full_name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        role_name: staffData.role,
        shift: staffData.shift,
        status: staffData.status,
        password: staffData.password
      };
      await api.put(`/staff/${id}`, payload);
      await fetchData(true);
      addActivity(`Staff profile updated: ${staffData.name}`, 'info');
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  }, [fetchData, addActivity]);

  const deleteStaff = useCallback(async (id) => {
    try {
      await api.delete(`/staff/${id}`);
      await fetchData(true);
      addActivity('Staff member removed', 'warning');
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  }, [fetchData, addActivity]);

  const deleteTask = useCallback(async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      await fetchData(true);
      addActivity('Task deleted', 'warning');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [fetchData, addActivity]);

  const updateStock = useCallback(async (id, amount) => {
    try {
      const actionType = amount > 0 ? 'add' : 'remove';
      const quantity = Math.abs(amount);
      await api.patch(`/inventory/${id}`, { quantity, actionType });
      await fetchData(true);
      addActivity(`Stock updated for item ID: ${id}`, 'info');
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  }, [fetchData, addActivity]);

  const addInventoryItem = useCallback(async (itemData) => {
    try {
      await api.post('/inventory', itemData);
      await fetchData(true);
      addActivity(`New product onboarded: ${itemData.name}`, 'success');
    } catch (error) {
      console.error('Error adding inventory item:', error);
    }
  }, [fetchData, addActivity]);

  const deleteInventoryItem = useCallback(async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      await fetchData(true);
      addActivity('Product removed from stock', 'warning');
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  }, [fetchData, addActivity]);

  const addService = useCallback(async (serviceData) => {
    try {
      await api.post('/services', serviceData);
      await fetchData(true);
      addActivity(`New service added: ${serviceData.name}`, 'success');
      return { success: true };
    } catch (error) {
      console.error('Error adding service:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to add service' };
    }
  }, [fetchData, addActivity]);

  const updateServiceBookingStatus = useCallback(async (id, status) => {
    try {
      await api.patch(`/service-bookings/${id}/status`, { status });
      await fetchData(true);
      addActivity(`Service booking status updated to ${status}`, 'info');
    } catch (error) {
      console.error('Error updating service booking status:', error);
    }
  }, [fetchData, addActivity]);

  const addServiceBooking = useCallback(async (bookingData) => {
    try {
      const payload = {
        service_id: bookingData.serviceId,
        guest_id: bookingData.guestId || null,
        customer_name: bookingData.guestName,
        customer_email: bookingData.guestEmail || '',
        customer_phone: bookingData.guestPhone || '',
        booking_date: bookingData.date,
        booking_time: bookingData.time,
        total_guests: bookingData.guests,
        total_amount: bookingData.total,
        notes: bookingData.notes || '',
        booking_status: 'pending'
      };
      await api.post('/service-bookings', payload);
      await fetchData(true);
      addActivity(`Service booking requested: ${bookingData.serviceName}`, 'success');
      return { success: true };
    } catch (error) {
      console.error('Error adding service booking:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to book service' };
    }
  }, [fetchData, addActivity]);

  const value = React.useMemo(() => ({
    rooms, updateRoomStatus, updateRoom, addRoom, deleteRoom,
    tables, addTable, updateTableStatus, deleteTable,
    reservations, addReservation, approveReservation, rejectReservation, checkInReservation, completeReservation, cancelReservation, deleteReservation,
    folios, addToFolio, settleFolio,
    staff, addStaff, updateStaff, deleteStaff,
    tasks, addTask, updateTaskStatus, deleteTask,
    inventory, updateStock, addInventoryItem, deleteInventoryItem,
    services, addService, serviceBookings, updateServiceBookingStatus, addServiceBooking,
    activityLog, addActivity,
    loading, error, refreshData: () => fetchData(true)
  }), [
    rooms, updateRoomStatus, updateRoom, addRoom, deleteRoom,
    tables, addTable, updateTableStatus, deleteTable,
    reservations, addReservation, approveReservation, rejectReservation, checkInReservation, completeReservation, cancelReservation, deleteReservation,
    folios, addToFolio, settleFolio,
    staff, addStaff, updateStaff, deleteStaff,
    tasks, addTask, updateTaskStatus, deleteTask,
    inventory, updateStock, addInventoryItem, deleteInventoryItem,
    services, serviceBookings, updateServiceBookingStatus,
    activityLog, addActivity,
    loading, error, fetchData
  ]);

  return (
    <HospitalityContext.Provider value={value}>
      {children}
    </HospitalityContext.Provider>
  );
};
