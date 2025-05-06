const express = require('express');
const router = express.Router();
const { register, login, registerAdmin, verifyAdminCode } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-admin-code', verifyAdminCode);
router.post('/register-admin', registerAdmin);

module.exports = router; 