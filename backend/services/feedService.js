const Post = require('../models/postSchema');
const cache = require('../utils/cache');
const { getFallbackPosts } = require('./externalFallback');

const FEED_LIMIT_DEFAULT = 12;
const FEED_LIMIT_MAX = 30;

const encodeCursor = (rankScore, id) =>
  Buffer.from(JSON.stringify({ rankScore, id }), 'utf8').toString('base64url');

const decodeCursor = (cursor) => {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));

    if (typeof decoded.rankScore !== 'number' || !decoded.id) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};

// نبني filter حسب الفلاتر المطلوبة
const buildFilter = ({ type, city, category, cursor }) => {
  const filter = { status: 'approved', isResolved: false };

  if (type && type !== 'all') filter.type = type;
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
const PROJECTION = {
  type: 1,
  title: 1,
  description: 1,
  images: 1,
  city: 1,
  area: 1,
  location: 1,
  status: 1,
  isResolved: 1,
  itemDate: 1,
  reward: 1,
  likesCount: 1,
  commentsCount: 1,
  viewsCount: 1,
  rankScore: 1,
  createdAt: 1,
  lastActivityAt: 1,
  user: 1,
  category: 1,
};

const feedService = {
  // جلب الفيد
  async getFeed({ type = 'all', city, category, cursor, limit: rawLimit }) {
    // نحدد limit مع حماية من القيم الكبيرة
    const limit = Math.min(parseInt(rawLimit, 10) || FEED_LIMIT_DEFAULT, FEED_LIMIT_MAX);

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

    const filter = buildFilter({ type, city, category, cursor });

    const posts = await Post.find(filter, PROJECTION)
      .populate(POPULATE)
      .sort({ rankScore: -1, _id: -1 })
      .limit(limit)
      .lean();

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

      finalPosts = [...posts, ...fallback.posts]
        .sort((a, b) => {
          const aScore = a.rankScore || 0;
          const bScore = b.rankScore || 0;
          if (bScore !== aScore) return bScore - aScore;
          return b._id.toString().localeCompare(a._id.toString());
        })
        .slice(0, limit);

      usedFallback = true;
    }

    let nextCursor = null;

    // نبني cursor للصفحة الجاية
    if (finalPosts.length === limit) {
      const last = finalPosts[finalPosts.length - 1];

      // البوستات الخارجية ما بنعملها cursor
      if (!last.isFallback && last._id) {
        nextCursor = encodeCursor(last.rankScore || 0, last._id.toString());
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
    const post = await Post.findOne({ _id: postId, type: postType });

    if (!post) {
      throw {
        status: 404,
        message: 'Post not found',
      };
    }

    // هل المستخدم عامل لايك؟
    const alreadyLiked = post.likes.some(id =>
      id?.equals ? id.equals(userId) : id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // unlike
      post.likes.pull(userId);
    } else {
      // like
      post.likes.addToSet(userId);
    }

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

    const post = await Post.findOne({ _id: postId, type: postType });

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
    const post = await Post.findOneAndUpdate(
      { _id: postId, type: postType },
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
    const posts = await Post.find({
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
      await Post.bulkWrite(bulk);
    }

    // تنظيف الكاش بعد التحديث
    cache.del('feed:*');

    return {
      lostCount: posts.filter(post => post.type === 'lost').length,
      foundCount: posts.filter(post => post.type === 'found').length,
    };
  },
};

module.exports = feedService;
