import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);

      // Handle duplicate email error (code or message)
      if (
        (err.code === 11000 && err.keyPattern && err.keyPattern.email) ||
        (typeof err.message === 'string' && err.message.includes('E11000 duplicate key error') && err.message.includes('email'))
      ) {
        setError('Email already registered');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="register-error">{error}</div>}
        <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
        <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
