let io;
function initNotificationSocket(socketIO) {
  io = socketIO;
  io.on('connection', (socket) => {
    if (socket.userId) socket.join(`user:${socket.userId}`);
    socket.on('disconnect', () => { if (socket.userId) socket.leave(`user:${socket.userId}`); });
  });
}
const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, { ...data, timestamp: new Date().toISOString() });
};
module.exports = {
  initNotificationSocket,
  emitToUser,
  emitNewNotification: (userId, notification) => emitToUser(userId, 'new_notification', { notification }),
  emitUnreadCount: (userId, count) => emitToUser(userId, 'unread_count', { count })
};