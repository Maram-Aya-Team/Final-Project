const mongoose = require('mongoose');
const { Schema } = mongoose;

const UploadSchema = new Schema({
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  fileType: {
    type: String,
    enum: ['image','video','document','audio'],
    required: true
  },

  mimeType: {
    type: String,
    required: true
  },

  originalName: {
    type: String,
    required: true,
    maxlength: 255
  },

  size: {
    type: Number,
    required: true
  },

  cloudinaryId: {
    type: String,
    required: true,
    unique: true
  },

  url: {
    type: String,
    required: true
  },

  thumbnailUrl: {
    type: String,
    default: null
  },

  dimensions: {
    width: Number,
    height: Number
  },

  linkedTo: {
    entityType: {
      type: String,
      enum: ['Post','Claim','Report','User','Message']
    },
    entityId: Schema.Types.ObjectId
  },

  isPrivate: {
    type: Boolean,
    default: false
  },

  moderationStatus: {
    type: String,
    enum: ['pending','approved','rejected','flagged'],
    default: 'pending'
  },

  moderationResult: {
    type: Schema.Types.Mixed,
    default: null
  },

  fileHash: {
    type: String,
    index: true
  },

  //  لحذف الملفات المؤقتة تلقائيًا
  expiresAt: {
    type: Date,
    default: null
  }
},{
  timestamps: true,
  versionKey: false
});

UploadSchema.index({ uploadedBy: 1, createdAt: -1 });
UploadSchema.index({ 'linkedTo.entityId': 1, 'linkedTo.entityType': 1 });
UploadSchema.index({ moderationStatus: 1 });

//TTL لحذف الملفات المؤقتة
UploadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//TTL للمساعدة في منع تكرار الملفات
UploadSchema.index({ fileHash: 1 });

module.exports = mongoose.model('Upload', UploadSchema);