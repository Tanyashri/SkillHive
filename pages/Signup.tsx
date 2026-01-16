
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { GoogleIcon, LockIcon, UserIcon } from '../components/icons';
import { api } from '../services/api';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Role selection state
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [adminCode, setAdminCode] = useState('');

  const { signup, login, updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }

    if (role === 'admin' && adminCode !== 'admin123') {
        setError("Invalid Admin Secret Key. Access denied.");
        return;
    }

    setLoading(true);
    
    try {
      const success = await signup({
        name,
        email,
        password,
        bio,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`, // Generate random avatar
        skillsOffered: [],
        skillsWanted: [],
        availability: 'Flexible',
        rating: 5.0, // New users start with 5 stars
        role: role,
        blockedUsers: []
      });

      if (success) {
         if (role === 'admin') navigate('/admin');
         else navigate('/');
      } else {
        setError('Failed to create account. Email may already be in use.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (role === 'admin') {
        setError("Google Signup is not supported for Admin accounts.");
        return;
    }

    setLoading(true);
    
    try {
        // Trigger Google Login
        // If Supabase is active, this will redirect.
        // If simulation mode, it returns a mock user immediately.
        const user = await api.signInWithGoogle();
        
        if (user) {
            // Simulation Mode: manually update context and navigate
            updateProfile(user);
            navigate('/');
        }
    } catch (e) {
        console.error("Google signup failed", e);
        setError("Failed to sign up with Google.");
        setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-10">
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
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">Create Account</h1>
            </Link>
            <p className="mt-3 text-gray-600 dark:text-gray-300 font-medium">Start your {role === 'admin' ? 'administrative ' : 'learning '} journey</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl mt-6 mb-6">
            <button
                type="button"
                onClick={() => { setRole('user'); setError(''); }}
                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    role === 'user' 
                    ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <UserIcon className="w-4 h-4 mr-2" />
                Student/User
            </button>
            <button
                type="button"
                onClick={() => { setRole('admin'); setError(''); }}
                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    role === 'admin' 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <LockIcon className="w-4 h-4 mr-2" />
                Administrator
            </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
            
            {role === 'admin' && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 animate-fade-in-up">
                    <label htmlFor="adminCode" className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1 uppercase tracking-wide">
                        Admin Secret Key
                    </label>
                    <input
                        id="adminCode"
                        type="password"
                        required
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm"
                        placeholder="Enter secret code (Hint: admin123)"
                    />
                </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short Bio
              </label>
              <textarea
                id="bio"
                required
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                placeholder="Tell us a bit about yourself..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                    placeholder="••••••••"
                />
                </div>
                <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm PW
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                    placeholder="••••••••"
                />
                </div>
            </div>
          
          {error && <p className="text-sm text-center text-red-500 font-medium bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  role === 'admin' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:ring-indigo-500'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:ring-primary-500'
              }`}
            >
              {loading ? 'Creating Account...' : role === 'admin' ? 'Create Admin Account' : 'Sign Up'}
            </button>
          </div>
          
          <div className="text-center mt-4">
             <p className="text-sm text-gray-600 dark:text-gray-400">
               Already have an account?{' '}
               <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 hover:underline">
                 Sign in
               </Link>
             </p>
          </div>
        </form>

        {role === 'user' && (
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
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                    >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Continue with Google
                    </button>
                </div>
            </>
        )}

      </div>
    </div>
  );
};

export default Signup;
