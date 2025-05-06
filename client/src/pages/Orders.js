import { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Token present:', !!token);
        console.log('Making request to /orders');
        const response = await API.get('/orders');
        console.log('Orders response:', response.data);
        setOrders(response.data);
      } catch (err) {
        console.error('Detailed error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers
        });
        setError(
          err.response?.data?.error || 
          `Failed to fetch orders (${err.response?.status || 'unknown error'}). Please try again later.`
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      console.log('No token available');
    }
  }, [token]);

  if (!token) {
    return <div>Please login to view your orders.</div>;
  }

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <h3>Order #{order._id}</h3>
              <span className={`status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="order-details">
              <p>Restaurant: {order.restaurantId?.name}</p>
              <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
              <p>Total: ₹{order.total}</p>
            </div>
            <div className="order-items">
              <h4>Items:</h4>
              <ul>
                {order.items.map(item => (
                  <li key={item._id}>
                    {item.itemId?.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
