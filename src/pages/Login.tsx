import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      
      // Get the user's profile to determine role
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: patient } = await supabase
          .from('patients')
          .select('role')
          .eq('user_id', userData.user.id)
          .maybeSingle();
        
        if (patient) {
          // Set redirecting first
          setRedirecting(true);
          await new Promise(resolve => setTimeout(resolve, 300));
          navigate('/patient/dashboard');
          return;
        }
        
        const { data: doctor } = await supabase
          .from('doctors')
          .select('role')
          .eq('user_id', userData.user.id)
          .maybeSingle();
        
        if (doctor) {
          setRedirecting(true);
          await new Promise(resolve => setTimeout(resolve, 300));
          navigate('/doctor/dashboard');
          return;
        }
        
        // Default to admin if no patient or doctor profile found
        setRedirecting(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate('/admin/dashboard');
        return;
      }
      
      // Fallback: navigate to root and let App.tsx handle routing
      setRedirecting(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hidden div to keep component mounted */}
      <div className="hidden">keeping-auth-alive</div>
      
      {/* Full screen overlay - appears immediately with CSS */}
      {redirecting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgb(241, 245, 249)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
            <p className="text-slate-600 text-lg">Redirecting to your dashboard...</p>
          </div>
        </div>
      )}
      
      {/* Main login form - hidden when redirecting */}
      <div style={{ opacity: redirecting ? 0 : 1, pointerEvents: redirecting ? 'none' : 'auto' }}>
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-4 rounded-2xl shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
                GlucoTrax
              </h1>
              <p className="text-center text-slate-600 mb-8">
                Sign in to manage your therapy journey
              </p>

              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl flex items-start gap-3 border-2 border-red-300">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-slate-800 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || redirecting}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition transform hover:scale-[1.02]"
                >
                  {loading ? 'Signing in...' : redirecting ? 'Redirecting to Dashboard...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition"
                >
                  Don't have an account? Register
                </button>
              </div>
            </div>

            <p className="text-center text-slate-600 text-sm mt-6 font-medium">
              Secure health data tracking for therapy patients
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
