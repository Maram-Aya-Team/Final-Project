const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
let io; 
let feedHandlersAttached = false;

function attachFeedHandlers() {
  if (!io || feedHandlersAttached) return;
  feedHandlersAttached = true;
  io.on('connection', (socket) => {
    // توزيع المستخدم على  حسب الفلتر 
    socket.on('join_feed', ({ type = 'all', city = null } = {}) => {
      socket.join('feed:all');
      if (type !== 'all') socket.join(`feed:${type}`);
      if (city) socket.join(`feed:${city}`);
      if (city && type !== 'all') socket.join(`feed:${city}:${type}`);
    });

    socket.on('leave_feed', ({ type, city } = {}) => {
      socket.leave('feed:all');
      if (type) socket.leave(`feed:${type}`);
      if (city) socket.leave(`feed:${city}`);
      if (city && type) socket.leave(`feed:${city}:${type}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  // ميديا وير للتأكد من هوية المستخدم (لو ضيف مسموح يدخل)
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||socket.handshake.headers?.authorization?.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.sub;
        socket.isAuth = true;
      } else {
        socket.isAuth = false;
      }
      next();
    } catch {
      socket.isAuth = false;
      next();
    }
  });
  attachFeedHandlers();

  return io;
}

function bindSocketServer(socketIO) {
  io = socketIO;
  attachFeedHandlers();
}
function emitNewPost(post) {
  if (!io) return;

  const rooms = ['feed:all'];
  if (post.type) rooms.push(`feed:${post.type}`);
  if (post.city) {
    rooms.push(`feed:${post.city}`);
    if (post.type) rooms.push(`feed:${post.city}:${post.type}`);
  }

  rooms.forEach(room => {
    io.to(room).emit('new_post', {
      post,
      timestamp: new Date().toISOString(),
    });
  });}
function emitUpdatePost(postId, postType, changes) {
  if (!io) return;
  io.to('feed:all').emit('update_post', { postId, postType, changes });}

function emitNewLike(postId, postType, likesCount, userId) {
  if (!io) return;
  io.to('feed:all').emit('new_like', { postId, postType, likesCount, byUserId: userId });}

function emitNewComment(postId, postType, comment, commentsCount) {
  if (!io) return;
  io.to('feed:all').emit('new_comment', { postId, postType, comment, commentsCount });}

function getIO() {
  if (!io) throw new Error('Socket not initialized');
  return io;}

module.exports = { initSocket, bindSocketServer, getIO, emitNewPost, emitUpdatePost, emitNewLike, emitNewComment };
