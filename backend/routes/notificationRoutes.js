const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// جميع المسارات تتطلب تسجيل دخول
router.use(protect);

// العمليات العامة على الإشعارات
router.get('/', ctrl.getNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.patch('/read-all', ctrl.markAllAsRead);
router.delete('/clear-read', ctrl.clearRead);

// العمليات على إشعار محدد باستخدام الـ ID
router.patch('/:id/read', ctrl.markAsRead);
router.delete('/:id', ctrl.deleteNotification);

module.exports = router;