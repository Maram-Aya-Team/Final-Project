const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClaimSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },

  claimant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  postOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 2000,
    trim: true
  },

  proofDocuments: [{
    type: Schema.Types.ObjectId,
    ref: 'Upload'
  }],

  verificationAnswers: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],

  status: {
    type: String,
    enum: ['submitted','under_review','approved','rejected','cancelled','disputed'],
    default: 'submitted',
    index: true
  },

  ownerNote: {
    type: String,
    maxlength: 500,
    default: ''
  },

  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  autoVerified: {
    type: Boolean,
    default: false
  },

  resolvedAt: {
    type: Date,
    default: null
  },

  nextClaimAllowedAt: {
    type: Date,
    default: null
  }
},{
  timestamps: true,
  versionKey: false
});

//منع تقديم مطالبتين نشطات لنفس المستخدم على نفس البوست
ClaimSchema.index(
  { post: 1, claimant: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $nin: ['rejected','cancelled'] } }
  }
);

ClaimSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Claim', ClaimSchema);