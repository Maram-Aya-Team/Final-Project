const jwt = require('jsonwebtoken');
const User = require("../models/userSchema");
const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'لا يوجد توكن، الوصول مرفوض' });
    }
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    
    // دعم النوعين (id و sub) عشان التوافق
    const userId = decoded.sub || decoded.id; 
    const user = await User.findById(userId).select('-password');

    if (!user) return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'الحساب محظور' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'توكن غير صالح' });
  }
};

/* optionalAuth  بيعرف مين المستخدم لو موجود، ولو مش موجود بيدخله  */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      const userId = decoded.sub || decoded.id;
      const user = await User.findById(userId).select('-password');
      
      if (user && !user.isBanned) req.user = user;
    }
  } catch (error) {
    // لو التوكن خربان بنكمل كأنه ضيف بدون ما نعطل البرنامج
  }
  next();
};
const requireAdmin = (req, res, next) => {
  const roles = ['admin', 'moderator'];
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'هذا الإجراء مسموح للأدمن فقط' });
  }
  next();
};

module.exports = { authMiddleware, optionalAuth, requireAdmin };