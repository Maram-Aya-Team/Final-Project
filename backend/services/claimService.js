const mongoose = require('mongoose');
const Claim = require('../models/claim.schema');
const Post = require('../models/postSchema');
const notifService = require('./notificationService');

const POPULATE = [
  {path: 'claimant', select: 'name avatar'},
  {path: 'postOwner', select: 'name avatar'},
  {path: 'post', select: 'title images city type'},
];

const claimService = {
  // إنشاء طلب ملكية جديد
  async createClaim({claimantId, postId, postType, description, proofImages = []}) {
    if (!description || description.trim().length < 20)
      throw {status: 400, message: 'Description must be at least 20 characters'};

    const normalizedType = String(postType || '').toLowerCase();
    const legacyTypeMap = { founditem: 'found', lostitem: 'lost' };
    const resolvedType = ['lost', 'found'].includes(normalizedType) ? normalizedType : legacyTypeMap[normalizedType];
    if (!resolvedType) throw {status: 400, message: 'Invalid postType. Expected: lost, found, LostItem, or FoundItem'};
    if (!mongoose.Types.ObjectId.isValid(postId)) throw {status: 400, message: 'Invalid postId'};
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const post = await Post.findOne({ _id: postObjectId, type: resolvedType }).lean();

    if (!post) throw {status: 404, message: 'Post not found'};
    if (post.isResolved) throw {status: 400, message: 'Post is already resolved'};
    if (post.user.toString() === claimantId.toString())
      throw {status: 400, message: 'Cannot claim your own post'};

    const claim = await Claim.create({
      claimant: claimantId,
      post: postId,
      postOwner: post.user,
      description: description.trim(),
      proofImages,
    });

    // اشعار لصاحب البوست إنه في حد قدم طلب
    await notifService.createNotification({
      recipient: post.user,
      actor: claimantId,
      type: 'claim_submitted',
      title: 'New Claim on Your Post 📋',
      body: `Someone claims ownership of "${post.title}". Review their claim.`,
      actionUrl: `/claims/${claim._id}`,
      relatedEntity: {entityType: resolvedType, entityId: postObjectId},
    }).catch(() => {});

    return claim;
  },

  //  كل الطلبات اللي قدمها المستخدم أو اللي استلمها
  async getMyClaims({userId, role = 'claimant', status, page = 1, limit = 10}) {
    const safeLimit = Math.min(parseInt(limit, 10) || 10, 30);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;
    const filter = role === 'owner' ? {postOwner: userId} : {claimant: userId};
    if (status && status !== 'all') filter.status = status;

    const [claims, total] = await Promise.all([
      Claim.find(filter).populate(POPULATE).sort({createdAt: -1}).skip(skip).limit(safeLimit).lean(),
      Claim.countDocuments(filter),
    ]);

    return {claims, total, page: safePage, pages: Math.ceil(total / safeLimit)};
  },

  //  تفاصيل طلب معين
  async getClaimById(claimId, userId) {
    const claim = await Claim.findOne({
      _id: claimId,
      $or: [{claimant: userId}, {postOwner: userId}],
    }).populate(POPULATE).lean();
    if (!claim) throw {status: 404, message: 'Claim not found'};
    return claim;
  },

  // قبول الطلب وتسكير البوست
  async acceptClaim(claimId, ownerId, reviewNote = '') {
    const claim = await Claim.findOne({_id: claimId, postOwner: ownerId, status: 'pending'});
    if (!claim) throw {status: 404, message: 'Claim not found or already reviewed'};

    claim.status = 'accepted';
    claim.reviewedAt = new Date();
    claim.reviewNote = reviewNote;
    await claim.save();

    // حول حالة البوست لـ resolved عشان يختفي من الفيد
    await Post.findByIdAndUpdate(claim.post, {isResolved: true});

    await notifService.createNotification({
      recipient: claim.claimant,
      type: 'claim_approved',
      title: 'Claim Accepted! ✓',
      body: 'Your claim was accepted. You can now contact the post owner.',
      actionUrl: `/claims/${claimId}`,
    }).catch(() => {});

    return claim;
  },

  // رفض الطلب
  async rejectClaim(claimId, ownerId, reviewNote = '') {
    const claim = await Claim.findOne({_id: claimId, postOwner: ownerId, status: 'pending'});
    if (!claim) throw {status: 404, message: 'Claim not found'};

    claim.status = 'rejected';
    claim.reviewedAt = new Date();
    claim.reviewNote = reviewNote;
    await claim.save();

    await notifService.createNotification({
      recipient: claim.claimant,
      type: 'claim_rejected',
      title: 'Claim Rejected ⨉',
      body: `Your claim was reviewed and rejected. ${reviewNote ? 'Note: ' + reviewNote : ''}`,
      actionUrl: `/claims/${claimId}`,
    }).catch(() => {});

    return claim;
  },
};

module.exports = claimService;
