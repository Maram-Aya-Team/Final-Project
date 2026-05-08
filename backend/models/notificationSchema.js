const mongoose = require('mongoose');
const { Schema } = mongoose;

const NOTIFICATION_TYPES = [
  'match_found', 'new_message', 'claim_submitted', 'claim_approved', 'claim_rejected', 
  'post_expired', 'post_resolved', 'report_action', 'system_alert', 'qr_scanned', 
  'new_like', 'new_comment'
];

const NotificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    actionUrl: { type: String, default: null },

    relatedEntity: {
      entityType: { type: String, enum: ['Post', 'Conversation', 'Claim', 'Report', 'User', null], default: null },
      entityId: { type: Schema.Types.ObjectId, refPath: 'relatedEntity.entityType', default: null }
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    sortKey: { type: Number, default: () => Date.now() },
    pushSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
  }, 
  { timestamps: true, versionKey: false }
);
NotificationSchema.index({ recipient: 1, sortKey: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// اعدادات فرونت (لازم تتعدل وقبت الفرونت)
NotificationSchema.statics.TYPE_CONFIG = {
  match_found: { icon: 'Target', color: '#22C55E', label: 'Match Found' },
  new_message: { icon: 'MessageCircle', color: '#2563EB', label: 'New Message' },
  claim_submitted: { icon: 'ClipboardList', color: '#F59E0B', label: 'Claim Submitted' },
  claim_approved: { icon: 'CheckCircle', color: '#22C55E', label: 'Claim Approved' },
  claim_rejected: { icon: 'XCircle', color: '#DC2626', label: 'Claim Rejected' },
  post_expired: { icon: 'Clock', color: '#94A3B8', label: 'Post Expired' },
  post_resolved: { icon: 'PartyPopper', color: '#22C55E', label: 'Post Resolved' },
  report_action: { icon: 'Flag', color: '#DC2626', label: 'Report Action' },
  system_alert: { icon: 'Bell', color: '#2563EB', label: 'System Alert' },
  qr_scanned: { icon: 'QrCode', color: '#8B5CF6', label: 'QR Scanned' },
  new_like: { icon: 'Heart', color: '#F43F5E', label: 'New Like' },
  new_comment: { icon: 'MessageSquare', color: '#0EA5E9', label: 'New Comment' }
};

module.exports = mongoose.model('Notification', NotificationSchema);