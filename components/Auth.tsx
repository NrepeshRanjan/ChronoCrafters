import React, { useState } from 'react';
import { Button } from './Button';

interface AuthProps {
  onLogin: (username: string, password: string) => boolean;
  appName: string;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, appName }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Simulate API call for login
    await new Promise(resolve => setTimeout(resolve, 500));
    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid username or password.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-white mb-6">{appName} Admin Login</h2>
      {error && (
        <div className="bg-red-900 text-red-100 p-3 rounded-md mb-4 text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-300 text-sm font-semibold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-300 text-sm font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
          variant="primary"
          size="lg"
        >
          Login
        </Button>
      </form>
      <p className="text-center text-gray-400 text-sm mt-6">
        Hint: Username "admin", Password "password"
      </p>
    </div>
  );
};