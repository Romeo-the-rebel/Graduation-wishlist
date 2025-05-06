'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, getCurrentUser, logout } from '@/lib/appwrite';
import { useUser } from '@/app/context/UserContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      
      try {
        await logout();
      } catch (logoutError) {
        console.warn('Logout warning (no session to clear):', logoutError);
      }

      const session = await login(email, password);
      if (!session) throw new Error('Login session failed.');

      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('User data fetch failed.');

      const userData = {
        $id: currentUser.$id,
        username: currentUser.name || 'User',
        email: currentUser.email,
        phone: currentUser.phone || '',
        profilepicture:  '', 
      };

      setUser(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err.message);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6 text-center">
        <div className="text-2xl font-bold tracking-tight">🎓 Graduation Wishlist</div>

        <div className="space-y-4 text-left relative">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {isMounted && (
            <>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-100 border border-gray-300"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-100 border border-gray-300"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <div
                    className="absolute inset-y-0 right-0 px-2 flex items-center cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full py-3 rounded-xl transition duration-200 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-sm text-center mt-4">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/create-profile')}
                  className="text-blue-600 hover:underline"
                  disabled={loading}
                >
                  Sign up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
