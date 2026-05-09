const User = require('../models/userSchema');
const Post = require('../models/postSchema');
const cache = require('../utils/cache');

const ALLOWED_CITIES = ['Amman','Irbid','Zarqa','Ajloun','Jerash','Mafraq','Balqa','Madaba','Karak','Tafilah','Maan','Aqaba'];
const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;
const URL_REGEX = /^https?:\/\/.+/;

const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.username && !USERNAME_REGEX.test(data.username)) {
    errors.push('اسم المستخدم: من 3 إلى 30 حرف، حروف صغيرة وأرقام وشرطة سفلية فقط');
  }

  if (data.bio?.length > 300) {
    errors.push('الوصف يجب أن لا يتجاوز 300 حرف');
  }

  if (data.city && !ALLOWED_CITIES.includes(data.city)) {
    errors.push('المدينة غير صالحة');
  }

  if (data.socialLinks) {
    Object.keys(data.socialLinks).forEach(k => {
      if (data.socialLinks[k] && !URL_REGEX.test(data.socialLinks[k])) {
        errors.push(`رابط ${k} غير صالح`);
      }
    });
  }

  return errors;
};

const SAFE_FIELDS = 'name username email phone city bio avatar cover socialLinks privacy stats createdAt';
const PUBLIC_FIELDS = 'name username bio avatar cover city stats createdAt';

const profileService = {
  async getMyProfile(userId) {
    const user = await User.findById(userId)
      .select(`${SAFE_FIELDS} notificationPrefs privacy`)
      .lean();

    if (!user) throw { status: 404, message: 'المستخدم غير موجود' };

    return user;
  },

  async getPublicProfile(identifier) {
    const query = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: identifier }
      : { username: identifier.toLowerCase() };

    const cacheKey = `profile:${identifier}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const user = await User.findOne(query).select(PUBLIC_FIELDS).lean();

    if (!user) throw { status: 404, message: 'المستخدم غير موجود' };

    cache.set(cacheKey, user, 60);
    return user;
  },

  async updateProfile(userId, data) {
    const errors = validateProfileUpdate(data);
    if (errors.length > 0) {
      throw { status: 422, message: errors.join(' ؛ ') };
    }

    if (data.username) {
      const existing = await User.findOne({
        username: data.username.toLowerCase(),
        _id: { $ne: userId }
      }).lean();

      if (existing) {
        throw { status: 409, message: 'اسم المستخدم مستخدم بالفعل' };
      }
    }

    const allowed = ['name','username','bio','phone','city','socialLinks','privacy','notificationPrefs','avatar','cover'];
    const updates = {};

    allowed.forEach(k => {
      if (data[k] !== undefined) updates[k] = data[k];
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .select(`${SAFE_FIELDS} notificationPrefs privacy`)
    .lean();

    cache.del(`profile:${userId}`);
    if (user?.username) cache.del(`profile:${user.username}`);

    return user;
  },

  async getUserPosts({ userId, type = 'all', cursor, limit = 12 }) {
    const safeLimit = Math.min(parseInt(limit) || 12, 30);

    const filter = { user: userId, status: 'approved' };
    if (type !== 'all') filter.type = type;
    if (cursor) filter.createdAt = { $lt: new Date(cursor) };

    const posts = await Post.find(filter)
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();

    const nextCursor =
      posts.length === safeLimit
        ? posts[posts.length - 1].createdAt
        : null;

    return {
      posts,
      nextCursor,
      hasMore: nextCursor !== null
    };
  },

  async getSavedPosts(userId) {
    const user = await User.findById(userId)
      .populate({
        path: 'savedPosts.postId',
        populate: { path: 'category', select: 'name icon' }
      })
      .lean();

    const posts = (user?.savedPosts || [])
      .filter(s => s.postId)
      .map(s => s.postId);

    return posts;
  },

  async toggleSavePost(userId, postId) {
    const user = await User.findById(userId);

    const idx = user.savedPosts.findIndex(
      s => s.postId.toString() === postId
    );

    if (idx > -1) {
      user.savedPosts.splice(idx, 1);
      await user.save();
      return { saved: false };
    } else {
      user.savedPosts.push({ postId });
      await user.save();
      return { saved: true };
    }
  },

  async refreshStats(userId) {
    const statsData = await Post.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: {
          _id: null,
          total: { $sum: 1 },
          lost: { $sum: { $cond: [{ $eq: ["$type", "lost"] }, 1, 0] } },
          found: { $sum: { $cond: [{ $eq: ["$type", "found"] }, 1, 0] } },
          resolved: { $sum: { $cond: ["$isResolved", 1, 0] } }
      }}
    ]);

    const stats = statsData[0]
      ? {
          totalPosts: statsData[0].total,
          lostPosts: statsData[0].lost,
          foundPosts: statsData[0].found,
          resolvedPosts: statsData[0].resolved
        }
      : {
          totalPosts: 0,
          lostPosts: 0,
          foundPosts: 0,
          resolvedPosts: 0
        };

    await User.findByIdAndUpdate(userId, { $set: { stats } });

    return stats;
  }
};

module.exports = profileService;