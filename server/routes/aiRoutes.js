const express = require('express');
const router = express.Router();
const { generateCode } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware'); // Import protect directly

router.post('/generate', protect, generateCode);

module.exports = router;
