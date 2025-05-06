const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin registration code - in production, this should be in environment variables
const ADMIN_REGISTRATION_CODE = 'ADMIN123';

exports.verifyAdminCode = async (req, res) => {
  try {
    console.log('Verifying admin code. Request body:', req.body);
    const { adminCode } = req.body;
    
    if (!adminCode) {
      console.error('Admin code is missing');
      return res.status(400).json({ error: 'Admin code is required' });
    }

    const isValid = adminCode === ADMIN_REGISTRATION_CODE;
    console.log('Admin code verification result:', { isValid, providedCode: adminCode });
    res.json({ valid: isValid });
  } catch (err) {
    console.error('Admin code verification error:', err);
    res.status(500).json({ error: 'Failed to verify admin code' });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    console.log('Registering admin with data:', req.body);
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.error('Missing required fields:', { 
        hasName: !!name, 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      return res.status(400).json({ 
        error: 'All fields are required',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      console.error('Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create admin user - password will be hashed by the User model's pre-save hook
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    console.log('Admin user created:', user._id);
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.status(201).json({ 
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ error: err.message || 'Failed to register admin account' });
  }
};

exports.register = async (req, res) => {
  try {
    console.log('Registering user with data:', req.body);
    const user = await User.create(req.body);
    console.log('User created:', user._id);
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    console.log('Token generated for user:', user._id);
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    const { email, password } = req.body;
    
    // Find user and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', { id: user._id, role: user.role });
    console.log('Comparing passwords...');
    
    // Use the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('Password verified for user:', user._id);
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    console.log('Token generated for user:', user._id);
    
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};
