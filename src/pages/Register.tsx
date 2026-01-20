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
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      alert('Registered account successfully!');
      navigate('/login');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Register</h2>
      <input 
      placeholder="Email" 
      onChange={e => setEmail(e.target.value)}
      style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }} 
      />
      <input
       placeholder="Password" 
       type="password" 
       onChange={e => setPassword(e.target.value)}
       style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }} 
       />
      <button onClick={handleRegister} style={{ padding: '10px 20px', marginBottom: '10px' }}>Register</button>
      {/* Link to Register page */}
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
