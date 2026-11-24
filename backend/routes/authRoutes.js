const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register - Register new student account
router.post('/register', register);

// POST /api/auth/login - Login existing student
router.post('/login', login);

module.exports = router;
