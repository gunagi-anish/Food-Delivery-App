import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../api';
import './Home.css';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await restaurantAPI.getAll();
        setRestaurants(response.data);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return <div className="home-container loading">Loading restaurants...</div>;
  }

  if (error) {
    return <div className="home-container error">{error}</div>;
  }

  return (
    <div className="home-container">
      <h2>Available Restaurants</h2>
      {restaurants.length === 0 ? (
        <p className="no-restaurants">No restaurants available at the moment.</p>
      ) : (
        <div className="restaurants-grid">
          {restaurants.map(restaurant => (
            <Link 
              key={restaurant._id} 
              to={`/restaurant/${restaurant._id}`}
              className="restaurant-card"
            >
              <div className="restaurant-header">
                <h3>{restaurant.name}</h3>
                <span className={`status ${restaurant.isActive ? 'active' : 'inactive'}`}>
                  {restaurant.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="cuisine">{restaurant.cuisine}</p>
              <p className="address">{restaurant.address}</p>
              <div className="restaurant-footer">
                <span className="rating">Rating: {restaurant.rating}/5</span>
                <span className="menu-items">{restaurant.menu?.length || 0} items</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
