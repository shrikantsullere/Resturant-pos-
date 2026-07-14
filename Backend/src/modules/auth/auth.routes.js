const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/apple-login', authController.appleLogin);
router.put('/update-password', authenticate, authController.updatePassword);
router.put('/profile', authenticate, authController.updateProfile);
// router.get('/me', authenticate, authController.getMe);



module.exports = router;
