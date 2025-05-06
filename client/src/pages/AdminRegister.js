import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './AdminRegister.css';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    adminCode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!form.adminCode) {
      newErrors.adminCode = 'Admin code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      console.log('Verifying admin code...');
      // First verify the admin code
      const verifyResponse = await API.post('/auth/verify-admin-code', {
        adminCode: form.adminCode
      });

      console.log('Admin code verification response:', verifyResponse.data);

      if (!verifyResponse.data.valid) {
        setErrors({ adminCode: 'Invalid admin registration code' });
        setLoading(false);
        return;
      }

      console.log('Proceeding with admin registration...');
      // If code is valid, proceed with registration
      const response = await API.post('/auth/register-admin', {
        name: form.name,
        email: form.email,
        password: form.password
      });

      console.log('Admin registration successful:', response.data);
      
      // Store the token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      navigate('/admin');
    } catch (err) {
      console.error('Admin registration error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.data?.details) {
        setErrors(err.response.data.details);
      } else if (err.response?.data?.error) {
        setErrors({ general: err.response.data.error });
      } else if (err.message === 'Network Error') {
        setErrors({ general: 'Unable to connect to the server. Please try again.' });
      } else {
        setErrors({ general: 'Failed to register admin account. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-register-form">
        <h2>Admin Registration</h2>
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Enter your name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Admin Registration Code</label>
            <input
              type="password"
              value={form.adminCode}
              onChange={e => setForm({ ...form, adminCode: e.target.value })}
              required
              placeholder="Enter admin registration code"
            />
          </div>

          <button 
            type="submit" 
            className="admin-register-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register as Admin'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister; 