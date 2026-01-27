// src/pages/Register.tsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      alert('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        alert('Registered account successfully!');
        navigate('/login');
      } else {
        alert('Check your email to confirm registration.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container1">
      <div className="card">
        <h2 className="page-title" style={{textAlign: 'center'}}>Register</h2>

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

        <button
          onClick={handleRegister}
          disabled={loading}
          className="form-button1"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="muted-text" style={{ marginTop: '12px' }}>
          Already have an account? <Link to="/login"><u>Login here</u></Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
