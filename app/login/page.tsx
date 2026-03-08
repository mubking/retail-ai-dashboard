'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = 'https://retail-ai-backend-production.up.railway.app';
export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API}/auth/login`, { password });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch {
      setError('Invalid password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏪</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>Pricepal Admin</h1>
          <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: 14 }}>Enter your password to continue</p>
        </div>

        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 15, boxSizing: 'border-box', outline: 'none', color: '#111', marginBottom: 12 }}
        />

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, margin: '0 0 12px', textAlign: 'center' }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}