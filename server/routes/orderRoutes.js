const express = require('express');
const router = express.Router();
const { placeOrder, getOrders, getAdminOrders, updateStatus } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// User routes
router.post('/', auth, async (req, res, next) => {
  try {
    await placeOrder(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    await getOrders(req, res);
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.get('/admin', auth, async (req, res, next) => {
  try {
    await getAdminOrders(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    await updateStatus(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
