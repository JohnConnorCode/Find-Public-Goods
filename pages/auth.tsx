// pages/auth.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const AuthPage: React.FC = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handles both login and registration via email/password.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        // Login flow
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
        } else {
          router.push('/');
        }
      } else {
        // Registration flow
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else {
          // For registration, you might want to show a message about confirmation.
          router.push('/');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  // Handles Google (Gmail) OAuth login/registration.
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) {
        setError(error.message);
      }
      // The redirect will be handled by Supabase
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isLogin ? 'Log In' : 'Register'}
      </h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          {loading ? (isLogin ? 'Logging In...' : 'Registering...') : (isLogin ? 'Log In' : 'Register')}
        </button>
      </form>
      <div className="my-4 text-center text-gray-600">or</div>
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center bg-red-600 text-white p-3 rounded-lg font-bold hover:bg-red-700 transition"
      >
        {loading ? 'Please wait...' : 'Continue with Google'}
      </button>
      <div className="mt-6 text-center">
        {isLogin ? (
          <>
            <span>Don't have an account? </span>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setIsLogin(false)}
            >
              Register here
            </button>
          </>
        ) : (
          <>
            <span>Already have an account? </span>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setIsLogin(true)}
            >
              Log in here
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
