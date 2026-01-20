import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else navigate('/dashboard');
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
}
export {};
