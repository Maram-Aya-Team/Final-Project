const Notification = require('../schemas/notificationSchema');
const cache = require('../utils/cache');

// Cursor Helpers لعملية التصفح السريع
const encodeCursor = (sortKey, id) => Buffer.from(`${sortKey}:${id}`).toString('base64url');
const decodeCursor = (cursor) => {
  try {
    const [sortKey, id] = Buffer.from(cursor, 'base64url').toString().split(':');
    return { sortKey: parseInt(sortKey, 10), id };
  } catch { return null; }
};

const POPULATE_ACTOR = { path: 'actor', select: 'name avatar _id' };

const notificationService = {

  // إنشاء إشعار جديد وتصفير الكاش
  async createNotification({ recipient, actor = null, type, title, body, actionUrl, relatedEntity, metadata = {} }) {
    if (!recipient || !type || !title || !body) throw { status: 400, message: 'بيانات الإشعار ناقصة' };
    if (actor && actor.toString() === recipient.toString()) return null;

    const notif = await Notification.create({ recipient, actor, type, title, body, actionUrl: actionUrl || null, relatedEntity: relatedEntity || {}, metadata, sortKey: Date.now() });
    
    cache.del(`unread_count:${recipient}`);
    await notif.populate(POPULATE_ACTOR);
    return notif;
  },

  // جلب قائمة الإشعارات مع Cursor Pagination
  async getNotifications({ userId, type, cursor, limit = 20 }) {
    const safeLimit = Math.min(parseInt(limit) || 20, 50);
    const filter = { recipient: userId };
    if (type && type !== 'all') filter.type = type;

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        filter.$or = [{ sortKey: { $lt: decoded.sortKey } }, { sortKey: decoded.sortKey, _id: { $lt: decoded.id } }];
      }
    }

    const notifications = await Notification.find(filter).populate(POPULATE_ACTOR).sort({ sortKey: -1, _id: -1 }).limit(safeLimit).lean();
    const nextCursor = notifications.length === safeLimit ? encodeCursor(notifications[notifications.length - 1].sortKey, notifications[notifications.length - 1]._id.toString()) : null;

    return { notifications, nextCursor, hasMore: nextCursor !== null, count: notifications.length };
  },

  // حساب عدد الإشعارات غير المقروءة (مع كاش 30 ثانية)
  async getUnreadCount(userId) {
    const cacheKey = `unread_count:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached !== null) return cached;

    const count = await Notification.countDocuments({ recipient: userId, isRead: false });
    cache.set(cacheKey, count, 30);
    return count;
  },

  // تحويل إشعار واحد إلى مقروء
  async markAsRead(notificationId, userId) {
    const notif = await Notification.findOneAndUpdate({ _id: notificationId, recipient: userId, isRead: false }, { isRead: true, readAt: new Date() }, { new: true }).lean();
    if (notif) cache.del(`unread_count:${userId}`);
    return notif;
  },

  // تحويل كل إشعارات المستخدم لمقروءة
  async markAllAsRead(userId) {
    const result = await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true, readAt: new Date() });
    cache.del(`unread_count:${userId}`);
    return { modifiedCount: result.modifiedCount };
  },

  // حذف إشعار محدد
  async deleteNotification(notificationId, userId) {
    const deleted = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
    if (!deleted) throw { status: 404, message: 'الإشعار غير موجود' };
    cache.del(`unread_count:${userId}`);
    return { deleted: true };
  },

  // تنظيف الإشعارات المقروءة فقط
  async deleteAllRead(userId) {
    const result = await Notification.deleteMany({ recipient: userId, isRead: true });
    return { deletedCount: result.deletedCount };
  }
};

module.exports = notificationService;