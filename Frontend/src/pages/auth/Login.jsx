import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, roles } from '../../context/AuthContext';
import { LogIn, Mail, Lock, CookingPot, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import foodHero from '../../assets/food-hero.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, appleLogin, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);

    if (result.success) {
      const path = getDashboardPath(result.user.role_name);
      navigate(path);
    } else {
      showToastMessage(result.message, 'error');
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const result = await googleLogin(response.credential);
      if (result.success) {
        const path = getDashboardPath(result.user.role_name);
        navigate(path);
      } else {
        showToastMessage(result.message, 'error');
      }
    } catch (err) {
      showToastMessage(err.message || 'Google Sign-In failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!window.AppleID) {
      showToastMessage('Apple Sign-In is not loaded yet', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await window.AppleID.auth.signIn();
      const result = await appleLogin(response.authorization.id_token, response.user);
      if (result.success) {
        const path = getDashboardPath(result.user.role_name);
        navigate(path);
      } else {
        showToastMessage(result.message, 'error');
      }
    } catch (err) {
      console.error(err);
      if (err.error !== 'popup_closed_by_user') {
        showToastMessage(err.message || 'Apple Sign-In failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let googleSignInRendered = false;

    const renderGoogleButton = () => {
      if (window.google?.accounts?.id) {
        const container = document.getElementById('googleSignInDiv');
        if (container) {
          const containerWidth = container.clientWidth || (window.innerWidth < 460 ? window.innerWidth - 96 : 364);
          const buttonWidth = Math.min(Math.max(containerWidth, 200), 400);

          container.innerHTML = '';
          window.google.accounts.id.renderButton(
            container,
            { 
              theme: 'outline', 
              size: 'large', 
              width: buttonWidth, 
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'center'
            }
          );
          googleSignInRendered = true;
        }
      }
    };

    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        renderGoogleButton();
      }
    };

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        initializeGoogleSignIn();
        clearInterval(interval);
      }
    }, 100);

    const handleResize = () => {
      if (googleSignInRendered) {
        renderGoogleButton();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  React.useEffect(() => {
    const initializeAppleSignIn = () => {
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin,
          state: 'apple-auth-state',
          usePopup: true,
        });
      }
    };

    const interval = setInterval(() => {
      if (window.AppleID) {
        initializeAppleSignIn();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleDemoLogin = (role) => {
    const roleEmails = {
      ADMIN: 'admin@gilahouse.com',
      MANAGER: 'manager@gilahouse.com',
      WAITER: 'waiter@gilahouse.com',
      CHEF: 'chef@gilahouse.com',
      CASHIER: 'cashier@gilahouse.com',
      CUSTOMER: 'customer@gilahouse.com'
    };
    
    setEmail(roleEmails[role] || `${role.toLowerCase()}@gilahouse.com`);
    // Seeded password for all default users is admin123, manager123, etc.
    // Actually, I seeded them with role name + 123
    setPassword(`${role.toLowerCase()}123`);
  };

  return (
    <div className="h-screen w-full bg-background flex items-start md:items-center justify-center p-4 py-8 md:py-12 relative overflow-y-auto overflow-x-hidden scrollbar-hide">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-primary text-white rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
      {/* Background Tropical Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary/[0.05] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-surface rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-6xl bg-surface/70 border border-white/40 rounded-[40px] flex flex-col md:flex-row overflow-hidden shadow-2xl backdrop-blur-xl"
      >
        {/* Left Side: Branding & Full-Section Hero Image */}
        <div className="flex-1 relative overflow-hidden group min-h-[400px] md:min-h-full">
          {/* Hero Image covering full section */}
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            src={foodHero}
            alt="Food Hero"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Overlay Content (Logo & Footer) */}
          <div className="relative z-20 h-full flex flex-col justify-between p-8 md:p-12">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center p-1.5 shadow-xl shadow-black/10">
                  <img src="/1000464407-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-white drop-shadow-2xl uppercase italic">
                  Gila<span className="text-primary">House</span>
                </span>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/20 w-fit">
              <p className="text-white text-sm font-bold tracking-widest uppercase">Premium Dining Experience</p>
              <div className="w-12 h-1 bg-primary mt-3 rounded-full shadow-lg shadow-primary/50"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Section */}
        <div className="w-full md:w-[460px] p-8 md:p-12 flex flex-col justify-center bg-surface/50">
          <div className="flex flex-col mb-10">
            <h2 className="text-3xl font-black text-text-primary tracking-tight uppercase leading-none">Welcome <span className="text-primary">Back</span></h2>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mt-2 opacity-60">Access your restaurant management hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@gilahouse.com"
                className="w-full px-5 py-3.5 bg-surface/80 border border-black/5 rounded-2xl text-text-primary font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-surface/80 border border-black/5 rounded-2xl text-text-primary font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] font-black text-text-secondary hover:text-primary transition-colors uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign in
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/5"></div>
            <span className="text-[9px] text-text-secondary uppercase font-black tracking-widest opacity-40">Or Continue With</span>
            <div className="h-px flex-1 bg-black/5"></div>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <div 
              id="googleSignInDiv" 
              className="w-full flex justify-center overflow-hidden rounded-2xl"
              style={{ minHeight: '44px' }}
            ></div>
            
            <button
              type="button"
              onClick={handleAppleLogin}
              className="w-full py-3.5 bg-text-primary text-white border border-transparent rounded-2xl font-bold hover:bg-black/90 hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.05.04 2.02.43 2.75 1.15-2.28 1.41-1.92 4.67.61 5.67-.84 2.37-1.87 4.91-3.03 6.11zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-[11px] uppercase tracking-widest">Continue with Apple</span>
            </button>
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/5"></div>
            <span className="text-[9px] text-text-secondary uppercase font-black tracking-widest opacity-40">Quick Access Portals</span>
            <div className="h-px flex-1 bg-black/5"></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.keys(roles).map((role) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                className="px-2 py-3 bg-surface/80 border border-black/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-text-secondary hover:border-primary/50 hover:text-primary hover:bg-surface transition-all flex flex-col items-center gap-1 shadow-sm"
              >
                <span className="truncate w-full">{role}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
