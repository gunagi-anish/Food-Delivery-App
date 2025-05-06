const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  console.log(`Creating uploads directory at ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  console.log(`Uploads directory exists at ${uploadDir}`);
}

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Add file filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Debug middleware for admin routes
router.use((req, res, next) => {
  console.log('\n=== Admin Route Request ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Files:', req.file || req.files || 'No files');
  console.log('========================\n');
  next();
});

// Get all orders (admin only)
router.get('/orders', auth, admin, async (req, res) => {
  try {
    console.log('Fetching all orders for admin');
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('restaurantId', 'name menu')
      .sort({ createdAt: -1 });

    // Attach menu item details from restaurant's menu array as itemId
    const ordersWithMenuDetails = orders.map(order => {
      const restaurantMenu = Array.isArray(order.restaurantId?.menu) ? order.restaurantId.menu : [];
      const items = order.items.map(item => {
        const menuItem = restaurantMenu.find(m => m._id && item.itemId && m._id.toString() === item.itemId.toString());
        return {
          ...item.toObject(),
          itemId: menuItem ? menuItem.toObject() : undefined
        };
      });
      return {
        ...order.toObject(),
        items
      };
    });

    res.json(ordersWithMenuDetails);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Error fetching orders',
      details: error.message 
    });
  }
});

// Update order status (admin only)
router.patch('/orders/:orderId/status', auth, admin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Populate the updated order before sending response
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('restaurantId', 'name')
      .populate('items.itemId');

    res.json(populatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      error: 'Error updating order status',
      details: error.message 
    });
  }
});

// Get all restaurants (admin only)
router.get('/restaurants', auth, admin, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ name: 1 });
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ 
      error: 'Error fetching restaurants',
      details: error.message 
    });
  }
});

// Create a new restaurant (admin only)
router.post('/restaurants', auth, admin, async (req, res) => {
  try {
    console.log('=== Create Restaurant Request ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    const restaurant = new Restaurant({
      ...req.body,
      menu: [] // Initialize with empty menu
    });
    
    console.log('New restaurant object:', restaurant);
    const savedRestaurant = await restaurant.save();
    console.log('Restaurant created successfully:', savedRestaurant);
    
    res.status(201).json(savedRestaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ 
      error: 'Error creating restaurant',
      details: error.message 
    });
  }
});

// Update restaurant (admin only)
router.patch('/restaurants/:restaurantId', auth, admin, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const updates = req.body;

    // Use findByIdAndUpdate for atomic update
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ 
      error: 'Error updating restaurant',
      details: error.message 
    });
  }
});

// Simple test route for image upload (admin only)
router.post(
  '/upload-test',
  auth,
  admin,
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      console.log('File upload test:', req.file);
      const imagePath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');
      res.json({ 
        success: true, 
        message: 'File uploaded successfully', 
        file: req.file,
        url: imagePath
      });
    } catch (error) {
      console.error('Error in test upload:', error);
      res.status(500).json({ error: 'Upload test failed', details: error.message });
    }
  }
);

// Add a menu item to a restaurant (admin only) with simplified code
router.post(
  '/restaurants/:restaurantId/menu',
  auth,
  admin,
  (req, res, next) => {
    // Debug the request
    console.log('Menu item creation request:');
    console.log('Headers:', req.headers);
    console.log('Body before upload:', req.body);
    next();
  },
  upload.single('image'),
  async (req, res) => {
    try {
      console.log('Body after upload:', req.body);
      console.log('File details:', req.file);
      
      const { restaurantId } = req.params;
      const newItem = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category
      };
      
      if (req.file) {
        const imagePath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');
        newItem.image = imagePath;
        console.log('Image saved at path:', imagePath);
      }
      
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      restaurant.menu.push(newItem);
      await restaurant.save();
      res.status(201).json(restaurant.menu[restaurant.menu.length - 1]);
    } catch (error) {
      console.error('Error adding menu item:', error);
      res.status(500).json({ error: 'Error adding menu item', details: error.message });
    }
  }
);

// Update a menu item in a restaurant (admin only)
router.put(
  '/restaurants/:restaurantId/menu/:itemId',
  auth,
  admin,
  upload.single('image'),
  async (req, res) => {
    try {
      console.log('Updating menu item with file:', req.file);
      const { restaurantId, itemId } = req.params;
      const updates = req.body;
      if (req.file) {
        const imagePath = `/uploads/${req.file.filename}`.replace(/\\/g, '/');
        updates.image = imagePath;
        console.log('Image updated at path:', imagePath);
      }
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      const item = restaurant.menu.id(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      Object.assign(item, updates);
      await restaurant.save();
      res.json(item);
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ error: 'Error updating menu item', details: error.message });
    }
  }
);

module.exports = router; 