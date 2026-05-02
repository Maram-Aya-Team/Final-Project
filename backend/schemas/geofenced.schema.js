const mongoose = require('mongoose');
const { Schema } = mongoose;

const GeofencedZoneSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  description: {
    type: String,
    maxlength: 500
  },

  type: {
    type: String,
    enum: [
      'airport','train_station','mall','university',
      'hospital','park','hotel','custom'
    ],
    required: true
  },

  boundary: {
    type: {
      type: String,
      enum: ['Polygon','MultiPolygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },

  center: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },

  radiusMeters: {
    type: Number,
    default: null
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  stats: {
    totalPosts: { type: Number, default: 0 },
    activePosts: { type: Number, default: 0 },
    resolvedPosts: { type: Number, default: 0 }
  },

  notificationsEnabled: {
    type: Boolean,
    default: false
  },

  notificationConfig: {
    title: String,
    message: String,
    triggerOnPostType: {
      type: String,
      enum: ['lost','found','both'],
      default: 'both'
    }
  }
},{
  timestamps: true,
  versionKey: false
});

//لدعم geo queries مثل $geoIntersects
GeofencedZoneSchema.index({ boundary: '2dsphere' });
// لتحسين radius queries السريعة
GeofencedZoneSchema.index({ center: '2dsphere' });
GeofencedZoneSchema.index({ isActive: 1, type: 1 });

module.exports = mongoose.model('GeofencedZone', GeofencedZoneSchema);