const Restaurant = require('../models/Restaurant');

// Create a new restaurant
const createRestaurant = async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const restaurant = new Restaurant(req.body);
        console.log('Created restaurant object:', restaurant);
        const savedRestaurant = await restaurant.save();
        console.log('Saved restaurant:', savedRestaurant);
        res.status(201).json(savedRestaurant);
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.errors || 'Validation failed'
        });
    }
};

// Get all restaurants
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get restaurant menu by ID
const getMenu = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.json(restaurant.menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRestaurant,
    getRestaurants,
    getMenu
}; 