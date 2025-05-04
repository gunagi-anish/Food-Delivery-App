const express = require('express');
const router = express.Router();
const { placeOrder, getOrders, updateStatus } = require('../controllers/orderController');

router.post('/', placeOrder);
router.get('/:userId', getOrders);
router.patch('/:id', updateStatus);

module.exports = router;
