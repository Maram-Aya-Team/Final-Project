const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../utils/helpers');
const { emitToUser } = require('../sockets/notificationHandler');
const notificationController = {

  //  قائمة الإشعارات مع التصفح 
  getNotifications: asyncHandler(async (req, res) => {
    const { type, cursor, limit } = req.query;
    const result = await notificationService.getNotifications({ userId: req.user._id, type, cursor, limit });
    return res.status(200).json({ success: true, data: result.notifications, pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore, count: result.count } });
  }),//اشعاؤات ما انقرأت
  getUnreadCount: asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user._id);
    return res.status(200).json({ success: true, data: { count } });
  }),
  //تحويل لمقروء 1
  markAsRead: asyncHandler(async (req, res) => {
    const notif = await notificationService.markAsRead(req.params.id, req.user._id);
    if (notif) emitToUser(req.user._id.toString(), 'notification_read', { notificationId: req.params.id });
    return res.status(200).json({ success: true, data: { marked: !!notif } });
  }),
  //الكل مقروء
  markAllAsRead: asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user._id);
    emitToUser(req.user._id.toString(), 'notifications_read_all', {});
    return res.status(200).json({ success: true, data: result });
  }),
  // حذف إشعار من القائمة
  deleteNotification: asyncHandler(async (req, res) => {
    const result = await notificationService.deleteNotification(req.params.id, req.user._id);
    return res.status(200).json({ success: true, data: result });
  }),
  // حذف كل الإشعارات المقروءة
  clearRead: asyncHandler(async (req, res) => {
    const result = await notificationService.deleteAllRead(req.user._id);
    return res.status(200).json({ success: true, data: result });
  })
};

module.exports = notificationController;