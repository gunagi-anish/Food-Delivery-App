import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../api';
import './Menu.css';

const Menu = () => {
  const { id } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await restaurantAPI.getMenu(id);
        console.log('Menu response:', response.data);
        
        // Ensure we have valid data before setting state
        if (response.data && Array.isArray(response.data.menu)) {
          setMenuItems(response.data.menu);
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [id]);

  const addToCart = (item) => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = savedCart.find(i => i._id === item._id);
      
      const updatedCart = existingItem
        ? savedCart.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i)
        : [...savedCart, { ...item, restaurantId: id, qty: 1 }];
      
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Trigger storage event for navbar cart count update
      window.dispatchEvent(new Event('storage'));
      
      alert('Item added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  if (loading) {
    return <div className="menu-container loading">Loading menu...</div>;
  }

  return (
    <div className="menu-container">
      <h2>Menu</h2>
      {!menuItems || menuItems.length === 0 ? (
        <p className="no-items">No menu items available</p>
      ) : (
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item._id} className="menu-item">
              {item.image && (
                <img 
                  src={`http://localhost:5000${item.image}`} 
                  alt={item.name} 
                  style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '10px', marginBottom: '0.5rem' }} 
                  onError={(e) => {
                    console.log('Image load error, fallback to placeholder:', item.image);
                    e.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
                  }}
                />
              )}
              <div className="menu-item-details">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price}</p>
                {item.description && <p className="description">{item.description}</p>}
              </div>
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
