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
        // If user is admin, return all restaurants
        // Otherwise, only return active restaurants
        const query = req.user?.role === 'admin' ? {} : { isActive: true };
        const restaurants = await Restaurant.find(query)
            .select('name cuisine address phone rating isActive menu')
            .lean();
        res.json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get restaurant menu by ID
const getMenu = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id)
            .select('menu isActive')
            .lean();

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if restaurant is active for non-admin users
        if (!restaurant.isActive && req.user?.role !== 'admin') {
            return res.status(403).json({ 
                message: 'This restaurant is currently inactive',
                isActive: false
            });
        }

        res.json({
            menu: restaurant.menu,
            isActive: restaurant.isActive
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update restaurant status (admin only)
const updateRestaurantStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        console.log('Updating restaurant status:', {
            id,
            isActive,
            user: req.user,
            body: req.body
        });

        if (typeof isActive !== 'boolean') {
            console.log('Invalid status value:', isActive);
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Use findByIdAndUpdate with proper options
        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        ).select('name cuisine address phone rating isActive menu');

        if (!restaurant) {
            console.log('Restaurant not found:', id);
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        console.log('Updated restaurant:', restaurant);
        res.json(restaurant);
    } catch (error) {
        console.error('Error updating restaurant status:', error);
        res.status(500).json({ 
            message: 'Failed to update restaurant status',
            error: error.message 
        });
    }
};

module.exports = {
    createRestaurant,
    getRestaurants,
    getMenu,
    updateRestaurantStatus
}; 