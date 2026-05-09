const matchService = require('../services/matchService');
const { asyncHandler } = require('../utils/helpers');

const matchController = {
  getMyMatches: asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await matchService.getMyMatches({ userId: req.user._id, status, page, limit });
    return res.status(200).json({
      success: true,
      data: result.matches,
      pagination: { total: result.total, page: result.page, pages: result.pages },
    });
  }),

  acceptMatch: asyncHandler(async (req, res) => {
    const match = await matchService.acceptMatch(req.params.id, req.user._id);
    return res.status(200).json({ success: true, data: match });
  }),

  rejectMatch: asyncHandler(async (req, res) => {
    const { note } = req.body;
    const match = await matchService.rejectMatch(req.params.id, req.user._id, note);
    return res.status(200).json({ success: true, data: match });
  }),

  runMatching: asyncHandler(async (req, res) => {
    const { lostPostId } = req.params;
    const matches = await matchService.runMatchingForLostPost(lostPostId);
    return res.status(200).json({
      success: true,
      data: {
        created: matches?.length || 0,
        matchIds: (matches || []).map((m) => m._id),
      },
    });
  }),
};

module.exports = matchController;
