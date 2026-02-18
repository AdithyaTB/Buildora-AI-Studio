const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    deductCredits,
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); // Import protect properly

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/deduct-credits', protect, deductCredits);

module.exports = router;
