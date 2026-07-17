import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth, roles } from '@/context/AuthContext';
import { MenuProvider } from '@/context/MenuContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { CustomerProvider } from '@/context/CustomerContext';
import { HospitalityProvider } from '@/context/HospitalityContext';
import { CommunicationProvider } from '@/context/CommunicationContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastProvider } from '@/context/ToastContext';
import { SettingsProvider } from '@/context/SettingsContext';
import MainLayout from '@/layouts/MainLayout';
import ScrollToTop from '@/components/common/ScrollToTop';


// Website
import LandingPage from './pages/website/LandingPage';
import DigitalMenu from './pages/website/DigitalMenu';
import Excursions from './pages/website/Excursions';
import Transport from './pages/website/Transport';
import BookTable from './pages/website/BookTable';
import OrderingEntry from './pages/website/OrderingEntry';
import GuestCheckIn from './pages/website/GuestCheckIn';
import GuestDashboard from './pages/website/GuestDashboard';
import GuestMenu from './pages/website/GuestMenu';
import MyBill from './pages/website/MyBill';
import RequestChat from './pages/website/RequestChat';
import ChatReception from './pages/website/ChatReception';

// Auth
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Payment
import PaymentPage from './pages/Payment/PaymentPage';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentFailed from './pages/Payment/PaymentFailed';
import PaymentPending from './pages/Payment/PaymentPending';

// Dashboard - Admin
import Dashboard from './pages/dashboard/admin/Dashboard';
import Tables from './pages/dashboard/admin/Tables';
import Menu from './pages/dashboard/admin/Menu';
import Staff from './pages/dashboard/admin/Staff';
import Reports from './pages/dashboard/admin/Reports';
import Settings from './pages/dashboard/admin/Settings';
import QRManager from './pages/dashboard/admin/QRManager';
import ServiceManager from './pages/dashboard/admin/ServiceManager';
import Tasks from './pages/dashboard/admin/Tasks';
import Inventory from './pages/dashboard/admin/Inventory';

// Dashboard - Waiter
import POS from './pages/dashboard/waiter/POS';
import Orders from './pages/dashboard/waiter/Orders';

// Dashboard - Kitchen
import Kitchen from './pages/dashboard/kitchen/Kitchen';

// Dashboard - Customer
import CustomerHome from './pages/dashboard/customer/CustomerHome';
import CustomerOrderNow from './pages/dashboard/customer/CustomerOrderNow';
import CustomerOrders from './pages/dashboard/customer/CustomerOrders';
import CustomerFavorites from './pages/dashboard/customer/CustomerFavorites';
import CustomerProfile from './pages/dashboard/customer/CustomerProfile';
import CustomerSupport from './pages/dashboard/customer/CustomerSupport';
import CustomerReservations from './pages/dashboard/customer/CustomerReservations';
import CustomerMessages from './pages/dashboard/customer/CustomerMessages';
import CustomerServices from './pages/dashboard/customer/CustomerServices';
import CustomerCart from './pages/dashboard/customer/CustomerCart';
import CustomerRewards from './pages/dashboard/customer/CustomerRewards';
import CustomerPayments from './pages/dashboard/customer/CustomerPayments';
import CustomerSettings from './pages/dashboard/customer/CustomerSettings';

// Dashboard - Reception
import Rooms from './pages/dashboard/reception/Rooms';
import Reservations from './pages/dashboard/reception/Reservations';
import GuestFolio from './pages/dashboard/reception/GuestFolio';
import GuestBills from './pages/dashboard/reception/GuestBills';
import Concierge from './pages/dashboard/reception/Concierge';


// Dashboard - Common
import Settlements from './pages/dashboard/common/Settlements';
import Transactions from './pages/dashboard/common/Transactions';
import NotificationsPage from './pages/dashboard/common/Notifications';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const { role: routeRole } = useParams();
  
  if (!user) return <Navigate to="/login" />;
  
  const userRole = String(typeof user.role === 'object' ? user.role?.role_name || '' : (user.role || user.role_name || ''));
  
  // If route has a role prefix, it MUST match the user's role
  if (routeRole && routeRole.toUpperCase() !== userRole.toUpperCase()) {
    const correctPrefix = userRole.toLowerCase();
    return <Navigate to={`/${correctPrefix}/dashboard`} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole.toUpperCase())) {
    const correctPrefix = userRole.toLowerCase();
    return <Navigate to={`/${correctPrefix}/dashboard`} />;
  }
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  const userRole = String(typeof user.role === 'object' ? user.role?.role_name || '' : (user.role || user.role_name || ''));
  const rolePrefix = userRole.toLowerCase();
  if (userRole.toUpperCase() === roles.CUSTOMER) return <Navigate to="/customer/home" />;
  return <Navigate to={`/${rolePrefix}/dashboard`} />;
};

const ModuleRedirect = ({ module }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  const userRole = String(typeof user.role === 'object' ? user.role?.role_name || '' : (user.role || user.role_name || ''));
  const rolePrefix = userRole.toLowerCase();
  return <Navigate to={`/${rolePrefix}/${module}`} replace />;
};

const ThemeHandler = () => {
  useEffect(() => {
    // Force Gila House Tropical Palette
    const theme = { 
      primary: '#EF8E4B', 
      dark: '#F2994A', 
      light: '#FFF5EE' 
    };
    
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-primary-dark', theme.dark);
    document.documentElement.style.setProperty('--color-primary-light', theme.light);
  }, []);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <SettingsProvider>
            <MenuProvider>
              <OrdersProvider>
                <CustomerProvider>
                  <HospitalityProvider>
                    <CommunicationProvider>
                      <ThemeHandler />
                      <Router>
                        <ScrollToTop />
                        <Routes>
                          {/* Landing Page */}
                          <Route path="/" element={<LandingPage />} />
                          <Route path="/menu" element={<DigitalMenu />} />
                          <Route path="/excursions" element={<Excursions />} />
                          <Route path="/transport" element={<Transport />} />
                          <Route path="/book" element={<BookTable />} />
                          <Route path="/order" element={<OrderingEntry />} />
                          <Route path="/checkin" element={<GuestCheckIn />} />
                          <Route path="/guest-app" element={<GuestDashboard />} />
                          <Route path="/guest-menu" element={<GuestMenu />} />
                          <Route path="/my-bill" element={<MyBill />} />
                          <Route path="/request-chat" element={<RequestChat />} />
                          <Route path="/chat" element={<ChatReception />} />
                          
                          {/* Auth */}
                          <Route path="/login" element={<Login />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          
                          {/* Payment Routes */}
                          <Route path="/payment/:bookingId" element={<PaymentPage />} />
                          <Route path="/payment-success" element={<PaymentSuccess />} />
                          <Route path="/payment-failed" element={<PaymentFailed />} />
                          <Route path="/payment-pending/:bookingId" element={<PaymentPending />} />
                          
                          {/* Admin/Manager/Staff Routes */}
                          {/* Redirect generic routes to role-specific routes */}
                          <Route path="/dashboard" element={<DashboardRedirect />} />
                          <Route path="/tables" element={<ModuleRedirect module="tables" />} />
                          <Route path="/pos" element={<ModuleRedirect module="pos" />} />
                          <Route path="/orders" element={<ModuleRedirect module="orders" />} />
                          <Route path="/kitchen" element={<ModuleRedirect module="kitchen" />} />
                          <Route path="/tasks" element={<ModuleRedirect module="tasks" />} />
                          <Route path="/inventory" element={<ModuleRedirect module="inventory" />} />
                          <Route path="/staff" element={<ModuleRedirect module="staff" />} />
                          <Route path="/reports" element={<ModuleRedirect module="reports" />} />
                          <Route path="/rooms" element={<ModuleRedirect module="rooms" />} />
                          <Route path="/reservations" element={<ModuleRedirect module="reservations" />} />
                          <Route path="/folio" element={<ModuleRedirect module="folio" />} />
                          <Route path="/guest-bills" element={<ModuleRedirect module="guest-bills" />} />
                          <Route path="/settlements" element={<ModuleRedirect module="settlements" />} />
                          <Route path="/transactions" element={<ModuleRedirect module="transactions" />} />
                          <Route path="/concierge" element={<ModuleRedirect module="concierge" />} />

                          <Route path="/services" element={<ModuleRedirect module="services" />} />
                          <Route path="/qr-manager" element={<ModuleRedirect module="qr-manager" />} />
                          <Route path="/notifications" element={<ModuleRedirect module="notifications" />} />
                          <Route path="/settings" element={<ModuleRedirect module="settings" />} />

                          {/* Role-Specific Module Routes */}
                          <Route path="/:role/dashboard" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER, roles.CHEF, roles.CASHIER]}>
                              <MainLayout><Dashboard /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/tables" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER]}>
                              <MainLayout><Tables /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/pos" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER, roles.CASHIER]}>
                              <MainLayout><POS /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/orders" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER, roles.CHEF, roles.CASHIER]}>
                              <MainLayout><Orders /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/kitchen" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.CHEF]}>
                              <MainLayout><Kitchen /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/tasks" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER, roles.CHEF]}>
                              <MainLayout><Tasks /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/inventory" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.CHEF]}>
                              <MainLayout><Inventory /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/menu" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER]}>
                              <MainLayout><Menu /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/staff" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN]}>
                              <MainLayout><Staff /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/reports" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER]}>
                              <MainLayout><Reports /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/rooms" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER]}>
                              <MainLayout><Rooms /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/reservations" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER]}>
                              <MainLayout><Reservations /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/folio" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.CASHIER]}>
                              <MainLayout><GuestFolio /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/guest-bills" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.CASHIER]}>
                              <MainLayout><GuestBills /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/settlements" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.CASHIER]}>
                              <MainLayout><Settlements /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/transactions" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.CASHIER]}>
                              <MainLayout><Transactions /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/concierge" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER, roles.CHEF, roles.CASHIER]}>
                              <MainLayout><Concierge /></MainLayout>
                            </ProtectedRoute>
                          } />



                          <Route path="/:role/services" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER]}>
                              <MainLayout><ServiceManager /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/qr-manager" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER]}>
                              <MainLayout><QRManager /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/notifications" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN, roles.MANAGER, roles.WAITER, roles.CHEF, roles.CASHIER, roles.CUSTOMER]}>
                              <MainLayout><NotificationsPage /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/:role/settings" element={
                            <ProtectedRoute allowedRoles={[roles.ADMIN]}>
                              <MainLayout><Settings /></MainLayout>
                            </ProtectedRoute>
                          } />

                          {/* Customer Routes */}
                          <Route path="/customer" element={<Navigate to="/customer/home" replace />} />
                          
                          <Route path="/customer/home" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerHome /></MainLayout>
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/customer/order-now" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerOrderNow /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/orders" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerOrders /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/reservations" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerReservations /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/services" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerServices /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/favorites" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerFavorites /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/profile" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerProfile /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/support" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerSupport /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/messages" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerMessages /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/cart" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerCart /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/rewards" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerRewards /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/payments" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerPayments /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="/customer/settings" element={
                            <ProtectedRoute allowedRoles={[roles.CUSTOMER]}>
                              <MainLayout><CustomerSettings /></MainLayout>
                            </ProtectedRoute>
                          } />

                          <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                      </Router>
                    </CommunicationProvider>
                  </HospitalityProvider>
                </CustomerProvider>
              </OrdersProvider>
            </MenuProvider>
          </SettingsProvider>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
