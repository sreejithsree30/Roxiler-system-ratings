import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-center mb-4">Login to Store Rating System</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="text-center mt-4">
        <p>Don't have an account? <button className="btn-link" onClick={onToggle}>Sign up here</button></p>
      </div>

      <div className="text-center mt-4">
        <h3>Demo Accounts:</h3>
        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem' }}>
          <p><strong>Admin:</strong> admin@example.com / Admin123!</p>
          <p><strong>Store Owner:</strong> store1@example.com / Store123!</p>
          <p><strong>Normal User:</strong> user@example.com / User123!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
