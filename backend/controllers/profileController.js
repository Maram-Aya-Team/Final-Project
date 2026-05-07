const profileService  = require('../services/profileService');
const { asyncHandler } = require('../utils/helpers');

const profileController = {

  // GET /profile/me
  getMyProfile: asyncHandler(async (req, res) => {
    const profile = await profileService.getMyProfile(req.user._id);
    return res.status(200).json({ success: true, data: profile });
  }),

  // GET /profile/:identifier  (username or id)
  getPublicProfile: asyncHandler(async (req, res) => {
    const profile = await profileService.getPublicProfile(req.params.identifier);
    return res.status(200).json({ success: true, data: profile });
  }),

  // PUT /profile/me
  updateProfile: asyncHandler(async (req, res) => {
    const updated = await profileService.updateProfile(req.user._id, req.body);
    return res.status(200).json({ success: true, data: updated });
  }),

  // GET /profile/me/posts?type=all&cursor=...
  getMyPosts: asyncHandler(async (req, res) => {
    const { type, cursor, limit } = req.query;
    const result = await profileService.getUserPosts({
      userId: req.user._id, type, cursor, limit,
    });
    return res.status(200).json({
      success: true,
      data:    result.posts,
      pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore },
    });
  }),

  // GET /profile/:id/posts
  getUserPosts: asyncHandler(async (req, res) => {
    const { type, cursor, limit } = req.query;
    const result = await profileService.getUserPosts({
      userId: req.params.id, type, cursor, limit,
    });
    return res.status(200).json({
      success: true,
      data:    result.posts,
      pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore },
    });
  }),

  // GET /profile/me/saved
  getSavedPosts: asyncHandler(async (req, res) => {
    const result = await profileService.getSavedPosts(req.user._id);
    return res.status(200).json({ success: true, data: result });
  }),

  // POST /profile/me/save/:postType/:postId
  toggleSavePost: asyncHandler(async (req, res) => {
    const { postType, postId } = req.params;
    if (!['lost','found'].includes(postType)) {
      return res.status(400).json({ success: false, message: 'postType must be lost or found' });
    }
    const result = await profileService.toggleSavePost(req.user._id, postId, postType);
    return res.status(200).json({ success: true, data: result });
  }),

  // POST /profile/me/refresh-stats
  refreshStats: asyncHandler(async (req, res) => {
    const stats = await profileService.refreshStats(req.user._id);
    return res.status(200).json({ success: true, data: { stats } });
  }),
};

module.exports = profileController;