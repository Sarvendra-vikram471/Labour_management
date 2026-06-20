const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getUserProfile);
router.put('/profile', auth, authController.updateUserProfile);

module.exports = router;
