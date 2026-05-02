const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    // المستخدم المستقبِل للإشعار
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // المستخدم الي بوصل منه الاشعار
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
// نوع الإشعار
    type: {
      type: String,
      enum: [
        'match_found',  
        'new_message',       
        'claim_submitted',   
        'claim_approved',  
        'claim_rejected',   
        'post_expired', 
        'post_resolved', 
        'report_action',  
        'system_alert',   
        'qr_scanned',   
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    body: {
      type: String,
      required: true,
      maxlength: 500,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Post', 'Conversation', 'Claim', 'Report', 'User'],
      },
      entityId: {
        type: Schema.Types.ObjectId,
        refPath: 'relatedEntity.entityType',
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    pushSent: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    // تلقائي الحذف بعد 90 يوم
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//============================================INDEXES

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', NotificationSchema);