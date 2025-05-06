const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { 
    createRestaurant, 
    getRestaurants, 
    getMenu,
    updateRestaurantStatus 
} = require('../controllers/restaurantController');

// Create a new restaurant (admin only)
router.post('/', auth, admin, createRestaurant);

// Get all restaurants
router.get('/', getRestaurants);

// Get restaurant menu by ID
router.get('/:id/menu', getMenu);

// Update restaurant status (admin only)
router.patch('/:id/status', auth, admin, updateRestaurantStatus);

module.exports = router; 