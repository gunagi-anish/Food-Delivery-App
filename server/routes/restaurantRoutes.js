const express = require('express');
const router = express.Router();
const { getRestaurants, getMenu, createRestaurant } = require('../controllers/restaurantController');

// Create a new restaurant
router.post('/', (req, res, next) => {
    console.log('POST /api/restaurants route hit');
    createRestaurant(req, res, next);
});

// Get all restaurants
router.get('/', (req, res, next) => {
    console.log('GET /api/restaurants route hit');
    getRestaurants(req, res, next);
});

// Get restaurant menu by ID
router.get('/:id/menu', (req, res, next) => {
    console.log('GET /api/restaurants/:id/menu route hit');
    getMenu(req, res, next);
});

module.exports = router; 