const mongoose = require('mongoose');
const Match = require('../models/matchSchema');
const Post = require('../models/postSchema');
const notifService = require('./notificationService');

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'in', 'on', 'at', 'of', 'to', 'and', 'or', 'but', 'it', 'this', 'that',
  'في', 'على', 'من', 'إلى', 'هذا', 'هذه', 'و', 'أو', 'لكن', 'هو', 'هي',
]);

const MATCH_THRESHOLD = 40;
const POPULATE_MATCH = [
  {
    path: 'lostPost',
    select: 'title images city area itemDate category reward isResolved type status',
    populate: { path: 'category', select: 'name icon' },
  },
  {
    path: 'foundPost',
    select: 'title images city area itemDate category isResolved type status',
    populate: { path: 'category', select: 'name icon' },
  },
  { path: 'lostUser', select: 'name avatar' },
  { path: 'foundUser', select: 'name avatar' },
];

function extractKeywords(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function keywordOverlap(wordsA, wordsB) {
  if (!wordsA.length || !wordsB.length) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : Math.round((intersection / union) * 20);
}

function dateProximityScore(lostDate, foundDate) {
  if (!lostDate || !foundDate) return 0;
  const diffDays = Math.abs(new Date(lostDate) - new Date(foundDate)) / 86_400_000;
  if (diffDays < 3) return 15;
  if (diffDays < 7) return 10;
  if (diffDays < 30) return 5;
  return 0;
}

function computeScore(lostPost, foundPost) {
  const categoryScore = lostPost.category?.toString() === foundPost.category?.toString() ? 40 : 0;
  const cityScore = lostPost.city === foundPost.city ? 25 : 0;
  const dateScore = dateProximityScore(lostPost.itemDate, foundPost.itemDate);
  const lostWords = extractKeywords(`${lostPost.title || ''} ${lostPost.description || ''}`);
  const foundWords = extractKeywords(`${foundPost.title || ''} ${foundPost.description || ''}`);
  const keywordScore = keywordOverlap(lostWords, foundWords);

  return {
    total: categoryScore + cityScore + dateScore + keywordScore,
    breakdown: {
      category: categoryScore,
      city: cityScore,
      date: dateScore,
      keywords: keywordScore,
    },
  };
}

const matchService = {
  async runMatchingForLostPost(lostPostId) {
    if (!mongoose.Types.ObjectId.isValid(lostPostId))
      throw { status: 400, message: 'Invalid lost post id' };

    const lostPost = await Post.findOne({
      _id: lostPostId,
      type: 'lost',
      status: 'approved',
      isResolved: false,
    }).lean();

    if (!lostPost) throw { status: 404, message: 'Lost post not found or not eligible for matching' };

    const candidates = await Post.find({
      type: 'found',
      status: 'approved',
      isResolved: false,
      category: lostPost.category,
    }).lean();

    const created = [];
    for (const foundPost of candidates) {
      if (foundPost.user.toString() === lostPost.user.toString()) continue;

      const { total, breakdown } = computeScore(lostPost, foundPost);
      if (total < MATCH_THRESHOLD) continue;

      const exists = await Match.exists({ lostPost: lostPost._id, foundPost: foundPost._id });
      if (exists) continue;

      const match = await Match.create({
        lostPost: lostPost._id,
        foundPost: foundPost._id,
        lostUser: lostPost.user,
        foundUser: foundPost.user,
        similarityScore: total,
        scoreBreakdown: breakdown,
      });

      await Promise.all([
        notifService.createNotification({
          recipient: lostPost.user,
          type: 'match_found',
          title: 'Possible Match Found! 🎯',
          body: `We found a possible match for your lost item "${lostPost.title}".`,
          actionUrl: '/my-matches',
          relatedEntity: { entityType: 'Post', entityId: lostPost._id },
          metadata: { matchId: match._id, score: total },
        }),
        notifService.createNotification({
          recipient: foundPost.user,
          type: 'match_found',
          title: 'Your found item matched someone! 🎯',
          body: `"${foundPost.title}" might match someone's lost item.`,
          actionUrl: '/my-matches',
          relatedEntity: { entityType: 'Post', entityId: foundPost._id },
          metadata: { matchId: match._id, score: total },
        }),
      ]).catch(() => {});

      created.push(match);
    }

    return created;
  },

  async getMyMatches({ userId, status, page = 1, limit = 10 }) {
    const safeLimit = Math.min(parseInt(limit, 10) || 10, 30);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const filter = { $or: [{ lostUser: userId }, { foundUser: userId }] };
    if (status && status !== 'all') filter.status = status;

    const [matches, total] = await Promise.all([
      Match.find(filter)
        .populate(POPULATE_MATCH)
        .sort({ similarityScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Match.countDocuments(filter),
    ]);

    return { matches, total, page: safePage, pages: Math.ceil(total / safeLimit) };
  },

  async acceptMatch(matchId, userId) {
    const match = await Match.findOne({
      _id: matchId,
      status: 'pending',
      $or: [{ lostUser: userId }, { foundUser: userId }],
    });
    if (!match) throw { status: 404, message: 'Match not found or already reviewed' };

    match.status = 'accepted';
    match.reviewedBy = userId;
    match.reviewedAt = new Date();
    await match.save();

    const otherUser = match.lostUser.toString() === userId.toString() ? match.foundUser : match.lostUser;

    await notifService.createNotification({
      recipient: otherUser,
      type: 'match_found',
      title: 'Match Accepted ✅',
      body: 'The other party accepted the match. You can now contact each other.',
      actionUrl: '/my-matches',
      relatedEntity: { entityType: 'Post', entityId: match.lostPost },
      metadata: { matchId: match._id },
    }).catch(() => {});

    return match;
  },

  async rejectMatch(matchId, userId, note = '') {
    const match = await Match.findOne({
      _id: matchId,
      status: 'pending',
      $or: [{ lostUser: userId }, { foundUser: userId }],
    });
    if (!match) throw { status: 404, message: 'Match not found' };

    match.status = 'rejected';
    match.reviewedBy = userId;
    match.reviewedAt = new Date();
    match.rejectedNote = note;
    await match.save();

    return match;
  },
};

module.exports = matchService;
