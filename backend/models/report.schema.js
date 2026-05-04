const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema({
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  targetType: {
    type: String,
    enum: ['Post','User','Message','Conversation','Comment'],
    required: true
  },

  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },

  reason: {
    type: String,
    enum: [
      'spam','fake_item','inappropriate_content','harassment',
      'scam','wrong_category','duplicate','other'
    ],
    required: true
  },

  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },

  evidence: [{
    type: Schema.Types.ObjectId,
    ref: 'Upload'
  }],

  status: {
    type: String,
    enum: ['pending','under_review','resolved','dismissed'],
    default: 'pending',
    index: true
  },

  priority: {
    type: String,
    enum: ['low','medium','high','critical'],
    default: 'low'
  },

  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  adminNotes: {
    type: String,
    maxlength: 2000,
    default: ''
  },

  action: {
    type: String,
    enum: [
      'none','warned_user','post_removed',
      'user_suspended','user_banned','content_edited'
    ],
    default: 'none'
  },

  resolvedAt: {
    type: Date,
    default: null
  }
},{
  timestamps: true,
  versionKey: false
});

// مهم: منع تكرار البلاغ من نفس المستخدم على نفس الكيان
ReportSchema.index(
  { reportedBy: 1, targetId: 1, targetType: 1 },
  { unique: true }
);

ReportSchema.index({ status: 1, priority: -1, createdAt: 1 });
ReportSchema.index({ targetId: 1, targetType: 1 });

module.exports = mongoose.model('Report', ReportSchema);