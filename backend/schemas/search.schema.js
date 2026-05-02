const mongoose = require('mongoose');
const { Schema } = mongoose;

const SavedSearchSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },

  filters: {
    keyword: { type: String, maxlength: 200 },

    postType: {
      type: String,
      enum: ['lost','found','both'],
      default: 'both'
    },

    category: { type: String },

    dateFrom: { type: Date },
    dateTo: { type: Date },

    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number]
    },

    radiusKm: { type: Number, default: 10 },

    status: {
      type: String,
      enum: ['active','resolved','all'],
      default: 'active'
    },

    extras: { type: Map, of: Schema.Types.Mixed }
  },

  alertEnabled: {
    type: Boolean,
    default: false
  },

  alertFrequency: {
    type: String,
    enum: ['instant','daily','weekly'],
    default: 'daily'
  },

  lastAlertSentAt: {
    type: Date,
    default: null
  },

  runCount: {
    type: Number,
    default: 0
  },

  //TTL لحذف البحث إذا ما تم استخدامه
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  }
},{
  timestamps: true,
  versionKey: false
});

SavedSearchSchema.index({ user: 1, alertEnabled: 1 });

// تفعيل الحذف التلقائي عبر TTL
SavedSearchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SavedSearchSchema.index({ alertEnabled: 1, alertFrequency: 1, lastAlertSentAt: 1 });

module.exports = mongoose.model('SavedSearch', SavedSearchSchema);