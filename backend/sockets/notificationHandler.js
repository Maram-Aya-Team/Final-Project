let io;

// إعداد السوكت وربط كل مستخدم بـ Room خاصة فيه
function initNotificationSocket(socketIO) {
  io = socketIO;
  io.on('connection', (socket) => {
    if (socket.userId) socket.join(`user:${socket.userId}`);
    socket.on('disconnect', () => { if (socket.userId) socket.leave(`user:${socket.userId}`); });
  });
}

// دالة الإرسال الأساسية (Emit) لأي حدث يخص الإشعارات
const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, { ...data, timestamp: new Date().toISOString() });
};

// وظائف الإرسال المخصصة (New Notification / Unread Count)
module.exports = {
  initNotificationSocket,
  emitToUser,
  emitNewNotification: (userId, notification) => emitToUser(userId, 'new_notification', { notification }),
  emitUnreadCount: (userId, count) => emitToUser(userId, 'unread_count', { count })
};