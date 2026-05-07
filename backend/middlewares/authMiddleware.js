const jwt = require('jsonwebtoken');
const User = require('../schemas/userSchema');

/** حماية المسارات - التحقق من وجود Token صالح */
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub || decoded.id).select('-password');

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account banned' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/** دخول اختياري - يتعرف على المستخدم إذا كان مسجلاً، وإلا يكمل كـ Guest */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub || decoded.id).select('-password');
      if (user && !user.isBanned) req.user = user;
    }
  } catch { /* ضيف عادي */ }
  next();
};

/** صلاحيات الأدمن فقط */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { protect, optionalAuth, requireAdmin };