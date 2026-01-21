// Import useState to manage form input values (email and password)
import { useState } from 'react';

// Import the Supabase client to handle authentication
import { supabase } from '../supabaseClient';

// Import navigation and link utilities for page routing
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  // State to store user email input
  const [email, setEmail] = useState('');

  // State to store user password input
  const [password, setPassword] = useState('');

  // Used to redirect user after successful login
  const navigate = useNavigate();

  // Function to handle user login
  const handleLogin = async () => {
    // Frontend validation to avoid unnecessary API calls
    if (!email || !password) {
      alert('Email and password are required');
      return;
    }

    // Call Supabase authentication using email and password
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Show error message if login fails
    if (error) {
      alert(error.message);
    } else {
      // Redirect user to dashboard after successful login
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Login</h2>

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

      {/* Login button */}
      <button onClick={handleLogin} style={{ padding: '10px 20px', marginBottom: '10px' }}>
        Login
      </button>

      {/* Link to Register page */}
      <p>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

// Added to satisfy TypeScript isolatedModules requirement
export {};
