import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItemCount(cart.length);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Restaurant App</Link>
      </div>
      <div className="navbar-menu">
        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart" className="cart-link">
              Cart {cartItemCount > 0 && <span className="cart-count">({cartItemCount})</span>}
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin">Admin Panel</Link>
            )}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/admin/register" className="admin-register-link">Admin Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
