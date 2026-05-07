// استدعاء الموديلات - تأكدي أن الأسماء تطابق ملفاتك في مجلد models
const LostItem = require('../models/lostItemSchema'); 
const FoundItem = require('../models/foundItemSchema');
const User = require('../models/userSchema');

const cache = require('../utils/cache');

// تأكدي أن اسم الملف في المجلد هو externalFallback وليس externalFallback.service
const { getFallbackPosts } = require('./externalFallback');

const FEED_LIMIT_DEFAULT = 12;
const FEED_LIMIT_MAX = 30;

// نحول rankScore + id ل cursor
const encodeCursor = (rankScore, id) =>
  Buffer.from(`${rankScore}:${id}`).toString('base64url');

// نفك ال cursor
const decodeCursor = (cursor) => {
  try {
    const [rankScore, id] = Buffer.from(cursor, 'base64url').toString().split(':');

    return {
      rankScore: parseFloat(rankScore),
      id,
    };

  } catch {
    return null;
  }
};

// نبني filter حسب الفلاتر المطلوبة
const buildFilter = ({ city, category, cursor }) => {

  const filter = { status: 'approved', isResolved: false };

  if (city && city !== 'all') filter.city = city;

  if (category && category !== 'all') filter.category = category;

  // cursor pagination
  if (cursor) {

    const decoded = decodeCursor(cursor);

    if (decoded) {
      filter.$or = [
        { rankScore: { $lt: decoded.rankScore } },
        { rankScore: decoded.rankScore, _id: { $lt: decoded.id } },
      ];
    }
  }

  return filter;
};

// populate لل user + category
const POPULATE = [
  { path: 'user', select: 'name avatar _id' },
  { path: 'category', select: 'name icon' },
];

// نجيب الحقول المهمة فقط عشان الاداء
const PROJECTION = { title: 1, description: 1, images: 1, city: 1, area: 1, location: 1, status: 1, isResolved: 1, lostDate: 1, foundDate: 1, reward: 1, likesCount: 1, commentsCount: 1, viewsCount: 1, rankScore: 1, createdAt: 1, lastActivityAt: 1, user: 1, category: 1 };

const feedService = {

  // جلب الفيد
  async getFeed({ type = 'all', city, category, cursor, limit: rawLimit }) {

    // نحدد limit مع حماية من القيم الكبيرة
    const limit = Math.min(parseInt(rawLimit) || FEED_LIMIT_DEFAULT, FEED_LIMIT_MAX);

    // key خاص بالكاش حسب الفلاتر
    const cacheKey = `feed:${type}:${city || 'all'}:${category || 'all'}:${cursor || 'start'}`;

    const cached = cache.get(cacheKey);

    // اذا موجود بالكاش رجعه مباشرة
    if (cached) {
      return {
        ...cached,
        fromCache: true,
      };
    }

    const filter = buildFilter({ city, category, cursor });

    // نجيب زيادة شوي قبل الدمج والترتيب
    const batchSize = Math.ceil(limit * 1.5);

    // نجيب lost + found بنفس الوقت
    const [lostDocs, foundDocs] = await Promise.all([

      type !== 'found'
        ? LostItem.find(filter, PROJECTION)
            .populate(POPULATE)
            .sort({ rankScore: -1, _id: -1 })
            .limit(batchSize)
            .lean()
        : Promise.resolve([]),

      type !== 'lost'
        ? FoundItem.find(filter, PROJECTION)
            .populate(POPULATE)
            .sort({ rankScore: -1, _id: -1 })
            .limit(batchSize)
            .lean()
        : Promise.resolve([]),
    ]);

    // نضيف type لكل بوست و ندمجهم
    const merged = [
      ...lostDocs.map(doc => ({ ...doc, type: 'lost' })),
      ...foundDocs.map(doc => ({ ...doc, type: 'found' })),
    ].sort((a, b) =>
      b.rankScore !== a.rankScore
        ? b.rankScore - a.rankScore
        : b._id.toString().localeCompare(a._id.toString())
    );

    // نأخذ العدد المطلوب فقط
    const posts = merged.slice(0, limit);

    let usedFallback = false;

    let finalPosts = posts;

    // اذا البوستات قليلة نجيب بيانات خارجية
    if (posts.length < Math.ceil(limit * 0.5)) {

      const needed = limit - posts.length;

      const fallback = await getFallbackPosts({
        type,
        city: city || 'all',
        page: 1,
        limit: needed + 5,
      });

      finalPosts = [...posts, ...fallback.posts].slice(0, limit);

      usedFallback = true;
    }

    let nextCursor = null;

    // نبني cursor للصفحة الجاية
    if (finalPosts.length === limit) {

      const last = finalPosts[finalPosts.length - 1];

      // البوستات الخارجية ما بنعملها cursor
      if (!last.isFallback && last._id) {
        nextCursor = encodeCursor(last.rankScore, last._id.toString());
      }
    }

    const hasMore = nextCursor !== null || usedFallback;

    const result = {
      posts: finalPosts,
      nextCursor,
      hasMore,
      count: finalPosts.length,
      usedFallback,
    };

    // نخزن بالكاش
    cache.set(cacheKey, result, cursor ? 60 : 30);

    return result;
  },

  // like / unlike
  async toggleLike(postId, postType, userId) {

    const Model = postType === 'lost' ? LostItem : FoundItem;

    const post = await Model.findById(postId);

    if (!post) {
      throw {
        status: 404,
        message: 'Post not found',
      };
    }

    // هل المستخدم عامل لايك؟
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {

      // unlike
      post.likes.pull(userId);

      post.likesCount = Math.max(0, post.likesCount - 1);

    } else {

      // like
      post.likes.addToSet(userId);

      post.likesCount += 1;
    }

    // تحديث ترتيب البوست
    post.computeRankScore();

    await post.save();

    // تحديث الكاش
    cache.del('feed:*');

    return {
      liked: !alreadyLiked,
      likesCount: post.likesCount,
      rankScore: post.rankScore,
    };
  },

  // اضافة كومنت
  async addComment(postId, postType, userId, text) {

    if (!text?.trim()) {
      throw {
        status: 400,
        message: 'Comment text required',
      };
    }

    const Model = postType === 'lost' ? LostItem : FoundItem;

    const post = await Model.findById(postId);

    if (!post) {
      throw {
        status: 404,
        message: 'Post not found',
      };
    }

    const comment = {
      user: userId,
      text: text.trim(),
    };

    post.comments.push(comment);

    post.commentsCount += 1;

    // تحديث ترتيب البوست
    post.computeRankScore();

    await post.save();

    const newComment = post.comments[post.comments.length - 1];

    cache.del('feed:*');

    return {
      comment: newComment,
      commentsCount: post.commentsCount,
    };
  },

  // جلب بوست واحد
  async getPostById(postId, postType, userId) {

    const Model = postType === 'lost' ? LostItem : FoundItem;

    const post = await Model.findByIdAndUpdate(
      postId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate([
        { path: 'user', select: 'name avatar _id' },
        { path: 'category', select: 'name icon' },
        { path: 'comments.user', select: 'name avatar _id' },
      ])
      .lean();

    if (!post) {
      throw {
        status: 404,
        message: 'Post not found',
      };
    }

    // هل المستخدم عامل لايك؟
    const isLiked = userId
      ? post.likes?.some(id => id.toString() === userId.toString())
      : false;

    return {
      ...post,
      type: postType,
      isLiked,
    };
  },

  // cron job لتحديث rank score يوميا
  async recomputeAllRankScores() {

    const process = async (Model) => {

      const posts = await Model.find({
        status: 'approved',
        isResolved: false,
      });

      // تجهيز bulk updates
      const bulk = posts.map(post => ({
        updateOne: {
          filter: { _id: post._id },

          update: {
            $set: {
              rankScore: post.computeRankScore(),
            },
          },
        },
      }));

      // bulkWrite اسرع من save لكل بوست
      if (bulk.length) {
        await Model.bulkWrite(bulk);
      }

      return bulk.length;
    };

    const [lostCount, foundCount] = await Promise.all([
      process(LostItem),
      process(FoundItem),
    ]);

    // تنظيف الكاش بعد التحديث
    cache.del('feed:*');

    return {
      lostCount,
      foundCount,
    };
  },
};

module.exports = feedService;