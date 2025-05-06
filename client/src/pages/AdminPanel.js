import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, restaurantAPI } from '../api';
import API from '../api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [deletedOrderIds, setDeletedOrderIds] = useState(new Set());
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingRestaurant, setUpdatingRestaurant] = useState(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [menuForms, setMenuForms] = useState({});
  const [newMenuItem, setNewMenuItem] = useState({});
  const [showNewRestaurantForm, setShowNewRestaurantForm] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: '',
    phone: '',
    rating: 0,
    isActive: true
  });
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading data for tab:', activeTab);
      console.log('Token available:', !!localStorage.getItem('token'));

      if (activeTab === 'orders') {
        console.log('Fetching orders...');
        const response = await adminAPI.getAllOrders();
        console.log('Orders response:', response.data);
        setOrders(response.data);
      } else {
        console.log('Fetching restaurants...');
        const response = await adminAPI.getAllRestaurants();
        console.log('Restaurants response:', response.data);
        setRestaurants(response.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      setError(err.response?.data?.error || 'Error loading data');
      
      if (err.response?.status === 401) {
        console.log('Unauthorized, redirecting to login');
        navigate('/login');
      } else if (err.response?.status === 403) {
        console.log('Access denied, redirecting to home');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const handleDeleteOrder = (orderId) => {
    setDeletedOrderIds(prev => new Set([...prev, orderId]));
  };

  const visibleOrders = orders.filter(order => !deletedOrderIds.has(order._id));

  const handleRestaurantUpdate = async (restaurantId, updates) => {
    try {
      setUpdatingRestaurant(restaurantId);
      console.log('Updating restaurant:', restaurantId, 'with updates:', updates);
      
      // Validate the input
      if (typeof updates.isActive !== 'boolean') {
        throw new Error('Invalid status value');
      }

      // Use the admin API endpoint for updating restaurant
      const response = await adminAPI.updateRestaurant(restaurantId, updates);
      console.log('Update response:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Update the local state with the response data
      setRestaurants(prevRestaurants => 
        prevRestaurants.map(restaurant => 
          restaurant._id === restaurantId ? response.data : restaurant
        )
      );

      setError(null);
      setTimeout(() => {
        loadData();
      }, 1000);
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update restaurant status');
      loadData();
    } finally {
      setUpdatingRestaurant(null);
    }
  };

  const handleAddMenuItem = async (restaurantId) => {
    try {
      const res = await API.post(`/admin/restaurants/${restaurantId}/menu`, newMenuItem);
      setRestaurants(restaurants => restaurants.map(r => r._id === restaurantId ? {
        ...r,
        menu: [...(r.menu || []), res.data]
      } : r));
      setNewMenuItem({});
    } catch (err) {
      alert('Failed to add menu item');
    }
  };

  const handleEditMenuItem = async (restaurantId, itemId) => {
    try {
      const res = await API.put(`/admin/restaurants/${restaurantId}/menu/${itemId}`, menuForms[itemId]);
      setRestaurants(restaurants => restaurants.map(r => r._id === restaurantId ? {
        ...r,
        menu: r.menu.map(item => item._id === itemId ? res.data : item)
      } : r));
      setMenuForms(forms => ({ ...forms, [itemId]: undefined }));
    } catch (err) {
      alert('Failed to update menu item');
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      console.log('Submitting new restaurant data:', newRestaurant);
      console.log('Auth token:', localStorage.getItem('token') ? 'present' : 'missing');
      
      const response = await adminAPI.createRestaurant(newRestaurant);
      console.log('Restaurant created successfully:', response.data);
      setRestaurants([...restaurants, response.data]);
      setShowNewRestaurantForm(false);
      setNewRestaurant({
        name: '',
        description: '',
        cuisine: '',
        address: '',
        phone: '',
        rating: 0,
        isActive: true
      });
    } catch (err) {
      console.error('Error creating restaurant:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        headers: err.config?.headers
      });
      
      if (err.response?.status === 401) {
        setError('Please log in as an admin to create restaurants');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create restaurants');
      } else {
        const errorMessage = err.response?.data?.details || 
                           err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.message || 
                           'Failed to create restaurant';
        setError(errorMessage);
      }
    }
  };

  if (loading) {
    return <div className="admin-panel loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="admin-panel error">
        <h3>{error}</h3>
        <button onClick={() => loadData()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={activeTab === 'restaurants' ? 'active' : ''} 
          onClick={() => setActiveTab('restaurants')}
        >
          Restaurants
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="orders-section">
          {visibleOrders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            visibleOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>Order #{order._id.slice(-6)}</h4>
                    <p>Customer: {order.userId?.name || 'N/A'}</p>
                    <p>Restaurant: {order.restaurantId?.name || 'N/A'}</p>
                    <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="order-status">
                    <span className={`status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">
                        {item.itemId?.name || 'Unknown Item'} x {item.quantity}
                      </span>
                      <span className="item-price">
                        ₹{(item.itemId?.price || 0) * (item.quantity || 0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">₹{order.total}</span>
                </div>
                <div className="order-actions">
                  <label htmlFor={`order-status-${order._id}`} className="visually-hidden">
                    Order Status
                  </label>
                  <select
                    id={`order-status-${order._id}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    aria-label="Order Status"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={() => handleDeleteOrder(order._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="restaurants-section">
          <div className="restaurants-header">
            <h3>Restaurants</h3>
            <button 
              className="create-restaurant-btn"
              onClick={() => setShowNewRestaurantForm(!showNewRestaurantForm)}
            >
              {showNewRestaurantForm ? 'Cancel' : 'Create New Restaurant'}
            </button>
          </div>

          {showNewRestaurantForm && (
            <div className="new-restaurant-form">
              <h4>Create New Restaurant</h4>
              <form onSubmit={handleCreateRestaurant}>
                <div className="form-group">
                  <label htmlFor="restaurant-name">Restaurant Name</label>
                  <input
                    id="restaurant-name"
                    type="text"
                    placeholder="Restaurant Name"
                    value={newRestaurant.name}
                    onChange={e => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restaurant-description">Description</label>
                  <textarea
                    id="restaurant-description"
                    placeholder="Description"
                    value={newRestaurant.description}
                    onChange={e => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restaurant-cuisine">Cuisine</label>
                  <input
                    id="restaurant-cuisine"
                    type="text"
                    placeholder="Cuisine"
                    value={newRestaurant.cuisine}
                    onChange={e => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restaurant-address">Address</label>
                  <input
                    id="restaurant-address"
                    type="text"
                    placeholder="Address"
                    value={newRestaurant.address}
                    onChange={e => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restaurant-phone">Phone Number</label>
                  <input
                    id="restaurant-phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={newRestaurant.phone}
                    onChange={e => setNewRestaurant({ ...newRestaurant, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="restaurant-rating">Rating (0-5)</label>
                  <input
                    id="restaurant-rating"
                    type="number"
                    placeholder="Rating (0-5)"
                    min="0"
                    max="5"
                    step="0.1"
                    value={newRestaurant.rating}
                    onChange={e => setNewRestaurant({ ...newRestaurant, rating: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">Create Restaurant</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowNewRestaurantForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {restaurants.length === 0 ? (
            <p>No restaurants found</p>
          ) : (
            restaurants.map(restaurant => (
              <div key={restaurant._id} className="restaurant-card">
                <div className="restaurant-header">
                  <h4>{restaurant.name}</h4>
                  <span className={`status ${restaurant.isActive ? 'active' : 'inactive'}`}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                <p><strong>Address:</strong> {restaurant.address}</p>
                <p><strong>Phone:</strong> {restaurant.phone}</p>
                <p><strong>Rating:</strong> {restaurant.rating}/5</p>
                
                <div className="restaurant-actions">
                  <button
                    className={restaurant.isActive ? 'deactivate' : 'activate'}
                    onClick={() => handleRestaurantUpdate(restaurant._id, { isActive: !restaurant.isActive })}
                    disabled={updatingRestaurant === restaurant._id}
                  >
                    {updatingRestaurant === restaurant._id ? 'Updating...' : 
                     restaurant.isActive ? 'Deactivate Restaurant' : 'Activate Restaurant'}
                  </button>
                </div>

                <button
                  onClick={() => setExpandedRestaurant(expandedRestaurant === restaurant._id ? null : restaurant._id)}
                  className="edit-menu-btn"
                >
                  {expandedRestaurant === restaurant._id ? 'Hide Menu' : 'Edit Menu'}
                </button>

                {expandedRestaurant === restaurant._id && (
                  <div className="menu-management">
                    <h5>Menu Items</h5>
                    
                    <form
                      className="add-menu-item-form"
                      onSubmit={async e => {
                        e.preventDefault();
                        const formData = new FormData();
                        formData.append('name', newMenuItem.name || '');
                        formData.append('description', newMenuItem.description || '');
                        formData.append('price', newMenuItem.price || '');
                        formData.append('category', newMenuItem.category || '');
                        if (newMenuItem.imageFile) {
                          formData.append('image', newMenuItem.imageFile);
                        }
                        try {
                          const res = await API.post(
                            `/admin/restaurants/${restaurant._id}/menu`,
                            formData,
                            { headers: { 'Content-Type': 'multipart/form-data' } }
                          );
                          setRestaurants(restaurants =>
                            restaurants.map(r =>
                              r._id === restaurant._id
                                ? { ...r, menu: [...(r.menu || []), res.data] }
                                : r
                            )
                          );
                          setNewMenuItem({});
                        } catch (err) {
                          alert('Failed to add menu item');
                        }
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Name"
                        value={newMenuItem.name || ''}
                        onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newMenuItem.description || ''}
                        onChange={e => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={newMenuItem.price || ''}
                        onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={newMenuItem.category || ''}
                        onChange={e => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                        required
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setNewMenuItem({ ...newMenuItem, imageFile: e.target.files[0] })}
                      />
                      <button type="submit">Add Item</button>
                    </form>

                    <ul className="menu-list">
                      {(restaurant.menu || []).map(item => (
                        <li key={item._id} className="menu-list-item">
                          {menuForms[item._id] ? (
                            <form
                              className="edit-menu-item-form"
                              onSubmit={async e => {
                                e.preventDefault();
                                const formData = new FormData();
                                formData.append('name', menuForms[item._id].name);
                                formData.append('description', menuForms[item._id].description);
                                formData.append('price', menuForms[item._id].price);
                                formData.append('category', menuForms[item._id].category);
                                if (menuForms[item._id].imageFile) {
                                  formData.append('image', menuForms[item._id].imageFile);
                                }
                                console.log('FormData entries:');
                                for (let pair of formData.entries()) {
                                  console.log(pair[0], pair[1]);
                                }
                                try {
                                  console.log('Sending update request for menu item:', item._id);
                                  const res = await API.put(
                                    `/admin/restaurants/${restaurant._id}/menu/${item._id}`,
                                    formData,
                                    { headers: { 'Content-Type': 'multipart/form-data' } }
                                  );
                                  console.log('Update response:', res.data);
                                  setRestaurants(restaurants => restaurants.map(r => r._id === restaurant._id ? {
                                    ...r,
                                    menu: r.menu.map(m => m._id === item._id ? res.data : m)
                                  } : r));
                                  setMenuForms(forms => ({ ...forms, [item._id]: undefined }));
                                } catch (err) {
                                  console.error('Menu item update error:', err);
                                  alert('Failed to update menu item');
                                }
                              }}
                            >
                              <input
                                type="text"
                                value={menuForms[item._id].name}
                                onChange={e => setMenuForms(f => ({ ...f, [item._id]: { ...f[item._id], name: e.target.value } }))}
                                required
                              />
                              <input
                                type="text"
                                value={menuForms[item._id].description}
                                onChange={e => setMenuForms(f => ({ ...f, [item._id]: { ...f[item._id], description: e.target.value } }))}
                                required
                              />
                              <input
                                type="number"
                                value={menuForms[item._id].price}
                                onChange={e => setMenuForms(f => ({ ...f, [item._id]: { ...f[item._id], price: e.target.value } }))}
                                required
                              />
                              <input
                                type="text"
                                value={menuForms[item._id].category}
                                onChange={e => setMenuForms(f => ({ ...f, [item._id]: { ...f[item._id], category: e.target.value } }))}
                                required
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => setMenuForms(f => ({ ...f, [item._id]: { ...f[item._id], imageFile: e.target.files[0] } }))}
                              />
                              <button type="submit">Save</button>
                              <button type="button" onClick={() => setMenuForms(f => ({ ...f, [item._id]: undefined }))}>Cancel</button>
                            </form>
                          ) : (
                            <>
                              {item.image && (
                                <img 
                                  src={`http://localhost:5000${item.image}`} 
                                  alt={item.name} 
                                  style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '8px', marginBottom: '0.5rem' }} 
                                  onError={(e) => {
                                    console.log('Admin panel image load error:', item.image);
                                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                  }}
                                />
                              )}
                              <span><strong>{item.name}</strong> ({item.category}) - ₹{item.price}</span>
                              <span>{item.description}</span>
                              <button onClick={() => setMenuForms(f => ({ ...f, [item._id]: { ...item } }))}>Edit</button>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
