const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

const placeOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    
    // Validate required fields
    const { restaurantId, items, total } = req.body;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Validate each item
    for (const item of items) {
      if (!item.itemId || !item.quantity) {
        return res.status(400).json({ 
          error: 'Each item must have an itemId and quantity' 
        });
      }
    }

    const orderData = {
      userId: req.user._id,
      restaurantId,
      items,
      total,
      status: 'Pending'
    };

    console.log('Creating order with data:', orderData);
    
    const newOrder = await Order.create(orderData);
    console.log('Order created:', newOrder);

    // Populate the order with item details
    const populatedOrder = await Order.findById(newOrder._id)
      .populate({
        path: 'items.itemId',
        model: 'MenuItem'
      })
      .populate('restaurantId');

    console.log('Populated order:', populatedOrder);
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ 
      error: 'Failed to place order',
      details: err.message 
    });
  }
};

const getOrders = async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user._id);
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: 'items.itemId',
        model: 'MenuItem'
      })
      .populate('restaurantId')
      .sort({ createdAt: -1 });
    
    console.log('Found orders:', orders);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: err.message 
    });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    console.log('Fetching all orders for admin');
    const orders = await Order.find()
      .populate({
        path: 'items.itemId',
        model: 'MenuItem'
      })
      .populate('restaurantId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found orders:', orders);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: err.message 
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log('Updating order status:', { id, status });

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate({
      path: 'items.itemId',
      model: 'MenuItem'
    })
    .populate('restaurantId');

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('Updated order:', updated);
    res.json(updated);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ 
      error: 'Failed to update order status',
      details: err.message 
    });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getAdminOrders,
  updateStatus
};
