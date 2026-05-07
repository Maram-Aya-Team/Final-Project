const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/profileController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

// عمليات الملف الشخصي للمستخدم الحالي
router.use('/me', protect); 
router.get('/me', ctrl.getMyProfile);
router.put('/me', ctrl.updateProfile);
router.get('/me/posts', ctrl.getMyPosts);
router.get('/me/saved', ctrl.getSavedPosts);
router.post('/me/save/:postId', ctrl.toggleSavePost); 
router.post('/me/refresh-stats', ctrl.refreshStats);

// عرض الملفات الشخصية العامة (اختياري تسجيل الدخول)
router.get('/:identifier', optionalAuth, ctrl.getPublicProfile);
router.get('/:id/posts', optionalAuth, ctrl.getUserPosts);

module.exports = router;