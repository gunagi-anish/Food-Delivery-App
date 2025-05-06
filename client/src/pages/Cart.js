import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../api';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (itemId, change) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item => {
        if (item._id === itemId) {
          const newQty = Math.max(1, item.qty + change);
          return { ...item, qty: newQty };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeItem = (itemId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item._id !== itemId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!cart.length) {
        setError('Your cart is empty');
        return;
      }

      const restaurantId = cart[0].restaurantId;
      if (!restaurantId) {
        setError('Restaurant ID is missing. Please try adding items to cart again.');
        return;
      }

      setLoading(true);
      setError(null);

      // Calculate total
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      // Prepare order data
      const orderData = {
        restaurantId,
        items: cart.map(item => ({
          itemId: item._id,
          quantity: item.qty
        })),
        total
      };

      console.log('Submitting order:', orderData);

      const response = await orderAPI.create(orderData);
      console.log('Order response:', response.data);

      alert('Order placed successfully!');
      localStorage.removeItem('cart');
      setCart([]);
      navigate('/orders');
    } catch (error) {
      console.error('Order error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {error && <div className="error-message">{error}</div>}
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item._id} className="cart-item">
              <p>{item.name} - ₹{item.price} × {item.qty}</p>
              <div className="cart-item-controls">
                <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                <button onClick={() => removeItem(item._id)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <h4>Total: ₹{total}</h4>
            <button 
              onClick={placeOrder} 
              disabled={!localStorage.getItem('token') || cart.length === 0 || loading}
            >
              {loading ? 'Placing Order...' : localStorage.getItem('token') ? 'Place Order' : 'Login to Order'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
