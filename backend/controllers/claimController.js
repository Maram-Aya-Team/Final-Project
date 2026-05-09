const claimService= require('../services/claimService');
const { asyncHandler } = require('../utils/helpers');

const claimController = {

  createClaim: asyncHandler(async (req, res) => {
    const { postId, postType, description, proofImages } = req.body;
    if (!postId || !postType || !description)
      return res.status(400).json({ success: false, message: 'postId, postType, description required' });

    const claim = await claimService.createClaim({
      claimantId: req.user._id, postId, postType, description, proofImages,
    });
    return res.status(201).json({ success: true, data: claim });
  }),

  getMyClaims: asyncHandler(async (req, res) => {
    const { role, status, page, limit } = req.query;
    const result = await claimService.getMyClaims({ userId: req.user._id, role, status, page, limit });
    return res.status(200).json({ success: true, data: result.claims,
      pagination: { total: result.total, page: result.page, pages: result.pages } });
  }),

  getClaimById: asyncHandler(async (req, res) => {
    const claim = await claimService.getClaimById(req.params.id, req.user._id);
    return res.status(200).json({ success: true, data: claim });
  }),

  acceptClaim: asyncHandler(async (req, res) => {
    const { reviewNote } = req.body;
    const claim = await claimService.acceptClaim(req.params.id, req.user._id, reviewNote);
    return res.status(200).json({ success: true, data: claim });
  }),

  rejectClaim: asyncHandler(async (req, res) => {
    const { reviewNote } = req.body;
    const claim = await claimService.rejectClaim(req.params.id, req.user._id, reviewNote);
    return res.status(200).json({ success: true, data: claim });
  }),
};

module.exports = claimController;