const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  lostPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  foundPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  lostUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foundUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  similarityScore: { type: Number, default: 0, min: 0, max: 100 },
  scoreBreakdown: {
    category: { type: Number, default: 0 },
    city: { type: Number, default: 0 },
    date: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  rejectedNote: { type: String, default: '' },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
}, { timestamps: true, versionKey: false });

matchSchema.index({ lostPost: 1, foundPost: 1 }, { unique: true });
matchSchema.index({ lostUser: 1, status: 1, createdAt: -1 });
matchSchema.index({ foundUser: 1, status: 1, createdAt: -1 });
matchSchema.index({ similarityScore: -1 });
matchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Match', matchSchema);
