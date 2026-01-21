// src/pages/Register.tsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Supabase client for auth
import { useNavigate, Link } from 'react-router-dom'; // Navigation and linking

const Register: React.FC = () => {
  // Store user input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Loading state to prevent multiple submissions
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Function to handle user registration
  const handleRegister = async () => {
    // Frontend validation: require email and password
    if (!email || !password) {
      alert('Email and password are required');
      return;
    }

    setLoading(true); // Show loading indicator

    try {
      // Call Supabase to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Check if user object is returned before showing alert
      if (data.user) {
        alert('Registered account successfully!');
        navigate('/login'); // Redirect to login page
      } else {
        alert('Check your email to confirm registration.');
      }
    } catch (err: any) {
      // Show error message if signup fails
      alert(err.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Register</h2>

      {/* Email input field */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }}
      />

      {/* Password input field */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }}
      />

      {/* Register button */}
      <button
        onClick={handleRegister}
        disabled={loading} // Prevent multiple clicks
        style={{ padding: '10px 20px', marginBottom: '10px' }}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      {/* Link to Login page */}
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
