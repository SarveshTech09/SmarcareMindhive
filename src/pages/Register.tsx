import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type RegistrationStep = 'account' | 'profile' | 'complete';

export default function Register() {
  const [step, setStep] = useState<RegistrationStep>('account');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });

  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    starting_weight: '',
    goal_weight: '',
    has_diabetes: false,
    dc_code: '',
  });

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (accountData.password !== accountData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (accountData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (accountData.role === 'patient') {
      setStep('profile');
    } else {
      await completeRegistration();
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!profileData.name || !profileData.age || !profileData.gender || !profileData.height || !profileData.starting_weight) {
      setError('Please fill in all required fields');
      return;
    }

    await completeRegistration();
  };

  const completeRegistration = async () => {
    setLoading(true);
    try {
      await signUp(accountData.email, accountData.password, accountData.role);

      if (accountData.role === 'patient') {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          let doctorId = null;

          if (profileData.dc_code) {
            const { data: doctor } = await supabase
              .from('doctors')
              .select('id')
              .eq('dc_code', profileData.dc_code)
              .maybeSingle();

            if (doctor) {
              doctorId = doctor.id;
            }
          }

          await supabase.from('patients').insert({
            user_id: authData.user.id,
            name: profileData.name,
            age: parseInt(profileData.age),
            gender: profileData.gender,
            height: parseFloat(profileData.height),
            starting_weight: parseFloat(profileData.starting_weight),
            goal_weight: profileData.goal_weight ? parseFloat(profileData.goal_weight) : null,
            has_diabetes: profileData.has_diabetes,
            doctor_id: doctorId,
          });
        }
      }

      setStep('complete');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md border border-slate-200">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome Aboard!</h2>
          <p className="text-slate-600 text-lg mb-2">Your account has been created successfully.</p>
          <p className="text-slate-500 text-sm">You can now start tracking your health journey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-center text-slate-600 mb-8">
            {step === 'account' ? 'Start tracking your therapy journey' : 'Tell us about yourself'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl flex items-start gap-3 border-2 border-red-300">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {step === 'account' && (
            <form onSubmit={handleAccountSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Account Type
                </label>
                <select
                  value={accountData.role}
                  onChange={(e) => setAccountData({ ...accountData, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition font-medium"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-slate-800 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-800 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-3 rounded-xl font-bold text-white disabled:opacity-50 shadow-lg transition flex items-center justify-center gap-2 transform hover:scale-[1.02]"
              >
                {accountData.role === 'patient' ? 'Continue to Profile' : 'Create Account'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-slate-800 mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-white mb-2 drop-shadow">
                    Age <span className="text-red-300">*</span>
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    required
                    min="18"
                    max="120"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
                    placeholder="35"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-white mb-2 drop-shadow">
                    Gender <span className="text-red-300">*</span>
                  </label>
                  <select
                    id="gender"
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
                  >
                    <option value="" className="bg-blue-600">Select</option>
                    <option value="male" className="bg-blue-600">Male</option>
                    <option value="female" className="bg-blue-600">Female</option>
                    <option value="other" className="bg-blue-600">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="height" className="block text-sm font-semibold text-white mb-2 drop-shadow">
                    Height (cm) <span className="text-red-300">*</span>
                  </label>
                  <input
                    id="height"
                    type="number"
                    step="0.1"
                    value={profileData.height}
                    onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                    required
                    min="100"
                    max="250"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label htmlFor="starting_weight" className="block text-sm font-semibold text-white mb-2 drop-shadow">
                    Starting Weight (kg) <span className="text-red-300">*</span>
                  </label>
                  <input
                    id="starting_weight"
                    type="number"
                    step="0.1"
                    value={profileData.starting_weight}
                    onChange={(e) => setProfileData({ ...profileData, starting_weight: e.target.value })}
                    required
                    min="30"
                    max="300"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
                    placeholder="85"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="goal_weight" className="block text-sm font-semibold text-white mb-2 drop-shadow">
                  Goal Weight (kg)
                </label>
                <input
                  id="goal_weight"
                  type="number"
                  step="0.1"
                  value={profileData.goal_weight}
                  onChange={(e) => setProfileData({ ...profileData, goal_weight: e.target.value })}
                  min="30"
                  max="300"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
                  placeholder="75"
                />
              </div>

              <div>
                <label htmlFor="dc_code" className="block text-sm font-semibold text-white mb-2 drop-shadow">
                  Doctor Code (Optional)
                </label>
                <input
                  id="dc_code"
                  type="text"
                  value={profileData.dc_code}
                  onChange={(e) => setProfileData({ ...profileData, dc_code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
                  placeholder="DC12345"
                />
                <p className="text-sm text-gray-600 mt-1">Enter your doctor's code to link your account</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  id="has_diabetes"
                  type="checkbox"
                  checked={profileData.has_diabetes}
                  onChange={(e) => setProfileData({ ...profileData, has_diabetes: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="has_diabetes" className="text-sm font-semibold text-gray-900">
                  I have diabetes
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-semibold text-white disabled:opacity-50 shadow-sm transition"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>

              <button
                type="button"
                onClick={() => setStep('account')}
                className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm transition"
              >
                Back to Account Details
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
