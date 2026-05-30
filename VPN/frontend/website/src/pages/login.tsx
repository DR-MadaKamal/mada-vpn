import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Shield, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../utils/auth';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, register, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!username || !password) {
          throw new Error('Please fill in all fields');
        }
        await login(username, password);
        toast.success('Welcome back!');
      } else {
        if (!email || !username || !password) {
          throw new Error('Please fill in all fields');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await register({ email, username, password, full_name: fullName });
        toast.success('Account created!');
      }
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">SecureVPN</span>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-center mb-6 text-sm">
            {isLogin ? 'Sign in to your account' : 'Start your secure browsing experience'}
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-500"
                  placeholder="John Doe"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-500"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                {isLogin ? 'Username' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-500"
                placeholder="your_username"
                autoComplete={isLogin ? 'username' : 'off'}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-500"
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isLogin && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((level) => {
                      const score = Math.min(
                        (password.length > 0 ? 1 : 0) +
                        (password.length >= 6 ? 1 : 0) +
                        (/[A-Z]/.test(password) ? 1 : 0) +
                        (/[0-9]/.test(password) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(password) ? 1 : 0) +
                        (password.length >= 10 ? 1 : 0),
                        4
                      );
                      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
                      const labels = ['Weak', 'Fair', 'Good', 'Strong'];
                      return (
                        <div key={level} className={`h-1.5 flex-1 rounded-full ${level <= score ? colors[score-1] || 'bg-emerald-500' : 'bg-gray-700'}`} />
                      );
                    })}
                  </div>
                  <p className={`text-xs ${password.length < 6 ? 'text-red-400' : password.length < 8 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {password.length < 6 ? 'Weak - at least 6 characters' : password.length < 8 ? 'Fair - add numbers & symbols' : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
