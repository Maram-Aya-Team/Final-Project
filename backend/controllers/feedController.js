const feedService = require('../services/feedService'); 
const { asyncHandler, sendSuccess, sendError } = require('../utils/helpers');
const { emitNewLike, emitNewComment, emitUpdatePost } = require('../sockets/feedHandler');

const feedController = {

  // جلب المنشورات مع فلاتر ودعم السكرول اللانهائي
  getFeed: asyncHandler(async (req, res) => {
    const { type, city, category, cursor, limit } = req.query;
    const userId = req.user?._id;

    const result = await feedService.getFeed({ type, city, category, cursor, limit, userId });

    return res.status(200).json({
      success: true,
      data: result.posts,
      pagination: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        count: result.count,
        usedFallback: result.usedFallback,
      },
      fromCache: result.fromCache || false,
    });
  }),

  // جلب تفاصيل بوست واحد
  getPost: asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    
    if (!['lost', 'found'].includes(type)) {
      return sendError(res, 'نوع المنشور لازم يكون مفقود أو موجود', 400);
    }

    const post = await feedService.getPostById(id, type, req.user?._id);
    return sendSuccess(res, post);
  }),

  // عمل لايك أو إزالته وتحديث السوكت 
  toggleLike: asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    
    if (!['lost', 'found'].includes(type)) {
      return sendError(res, 'النوع غير معروف', 400);
    }
    const result = await feedService.toggleLike(id, type, req.user._id);

    // تحديث السوكت باللايك الجديد والعدد المحدث
    if (result) {
      emitNewLike(id, type, result.likesCount, req.user._id.toString());
      emitUpdatePost(id, type, { likesCount: result.likesCount });
    }

    return sendSuccess(res, result);
  }),

  // إضافة تعليق وتحديث السوكت بالكومنت والعدد
  addComment: asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    const { text } = req.body;

    if (!['lost', 'found'].includes(type) || !text?.trim()) {
      return sendError(res, 'البيانات ناقصة أو نوع البوست غلط', 400);
    }
    const result = await feedService.addComment(id, type, req.user._id, text);

    // تبلغ السوكت عشان يظهر الكومنت عند الكل بدون ريفريش
    if (result) {
      emitNewComment(id, type, result.comment, result.commentsCount);
      emitUpdatePost(id, type, { commentsCount: result.commentsCount });
    }

    return sendSuccess(res, result, 201);
  }),

  recomputeScores: asyncHandler(async (req, res) => {
    const result = await feedService.recomputeAllRankScores();
    return sendSuccess(res, result);
  }),
};

module.exports = feedController;
