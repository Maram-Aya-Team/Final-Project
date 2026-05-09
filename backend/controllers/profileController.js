const profileService  = require('../services/profileService');
const { asyncHandler } = require('../utils/helpers');

const profileController = {
  getMyProfile: asyncHandler(async (req, res) => {
    const profile = await profileService.getMyProfile(req.user._id);
    return res.status(200).json({ success: true, data: profile });
  }),
  getPublicProfile: asyncHandler(async (req, res) => {
    const profile = await profileService.getPublicProfile(req.params.identifier);
    return res.status(200).json({ success: true, data: profile });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const updated = await profileService.updateProfile(req.user._id, req.body);
    return res.status(200).json({ success: true, data: updated });
  }),
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
  getSavedPosts: asyncHandler(async (req, res) => {
    const result = await profileService.getSavedPosts(req.user._id);
    return res.status(200).json({ success: true, data: result });
  }),
  toggleSavePost: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
      return res.status(400).json({ success: false, message: 'postId is required' });
    }
    const result = await profileService.toggleSavePost(req.user._id, postId);
    return res.status(200).json({ success: true, data: result });
  }),
  refreshStats: asyncHandler(async (req, res) => {
    const stats = await profileService.refreshStats(req.user._id);
    return res.status(200).json({ success: true, data: { stats } });
  }),
};

module.exports = profileController;
