
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USERS } from '../constants';
import AnimatedBackground from '../components/AnimatedBackground';
import { GoogleIcon, LockIcon, UserIcon, XIcon } from '../components/icons';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<'user' | 'admin'>('user'); // New role state
  
  const { login, signup, updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Verify credentials first
      const success = await login(email, password);
      
      if (success) {
        const storedUser = JSON.parse(localStorage.getItem('skillhive_user') || '{}');
        
        if (storedUser && storedUser.role !== loginRole) {
            setError(`This account is not registered as an ${loginRole === 'admin' ? 'Admin' : 'User'}.`);
            localStorage.removeItem('skillhive_user');
            return;
        }

        if (loginRole === 'admin') {
            navigate('/admin');
        } else {
            navigate('/');
        }
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, role: 'user' | 'admin') => {
    setLoading(true);
    setLoginRole(role); 
    if (await login(demoEmail, 'password123')) {
         if (role === 'admin') navigate('/admin');
         else navigate('/');
    }
    setLoading(false);
  }

  const handleGoogleLogin = async () => {
    if (loginRole === 'admin') {
        setError("Google Login is not supported for Admin accounts.");
        return;
    }

    setLoading(true);
    setError('');
    
    try {
        const user = await api.signInWithGoogle();
        if (user) {
            // Simulation Mode: manually update context and navigate
            updateProfile(user);
            navigate('/');
        }
        // If user is null (Supabase mode), it will redirect and AuthContext will handle it on return.
    } catch (e) {
        console.error("Google login failed", e);
        setError("Failed to sign in with Google. Check your connection.");
        setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Back to Home Link */}
        <Link 
            to="/" 
            className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-all border border-white/20 dark:border-gray-700 shadow-sm hover:shadow-md group"
        >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
            Back to Home
        </Link>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 animate-pop-in">
        <div className="text-center">
            <Link to="/" className="inline-block transform hover:scale-105 transition-transform duration-300">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">SkillHive</h1>
            </Link>
            <p className="mt-3 text-gray-600 dark:text-gray-300 font-medium">
                {loginRole === 'admin' ? 'Admin Portal' : 'Join the community of learners'}
            </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl mt-8 mb-6">
            <button
                type="button"
                onClick={() => { setLoginRole('user'); setError(''); }}
                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    loginRole === 'user' 
                    ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <UserIcon className="w-4 h-4 mr-2" />
                User Login
            </button>
            <button
                type="button"
                onClick={() => { setLoginRole('admin'); setError(''); }}
                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    loginRole === 'admin' 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <LockIcon className="w-4 h-4 mr-2" />
                Admin Login
            </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-center text-red-500 font-medium bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  loginRole === 'admin' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:ring-indigo-500'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:ring-primary-500'
              }`}
            >
              {loading ? 'Signing in...' : `Sign in as ${loginRole === 'admin' ? 'Admin' : 'User'}`}
            </button>
          </div>
          
          {loginRole === 'user' && (
              <div className="text-center mt-4">
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                   Don't have an account?{' '}
                   <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-500 hover:underline">
                     Sign up
                   </Link>
                 </p>
              </div>
          )}
        </form>

        {loginRole === 'user' && (
            <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium backdrop-blur-sm">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50"
                    >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        {loading ? 'Connecting...' : 'Continue with Google'}
                    </button>
                </div>
            </>
        )}
        
        <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Demo Accounts</p>
            <div className="flex flex-wrap justify-center gap-2">
                {USERS.map(u => (
                    <button 
                        key={u.id} 
                        onClick={() => handleDemoLogin(u.email, u.role)} 
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            u.role === 'admin'
                            ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300'
                        }`}
                    >
                        {u.role === 'admin' ? `Admin (${u.name.split(' ')[0]})` : u.name.split(' ')[0]}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
