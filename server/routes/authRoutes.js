const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    deductCredits,
    updateProfile,
    updateAvatar,
    updateBanner,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/deduct-credits', protect, deductCredits);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.put('/banner', protect, upload.single('banner'), updateBanner);

module.exports = router;
