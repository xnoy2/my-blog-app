// src/pages/Login.tsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Email and password are required');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="page-container1">
      <div className="card">
        <h2 className="page-title" style={{ textAlign: 'center' }}>Login</h2>

        <label className="form-label">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        />

        <label className="form-label">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />

        <button onClick={handleLogin} className="form-button1">
          Login
        </button>

        <p className="muted-text" style={{ marginTop: '12px' }}>
          Don’t have an account? <Link to="/register"><u>Register here</u></Link>
        </p>
      </div>
    </div>
  );
}
