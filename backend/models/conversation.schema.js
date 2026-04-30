const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    //المشاركان في المحادثة
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    // مرجع للبوست المفقود 
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    // آخر رسالة —للعرض السريع في قائمة المحادثات
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageText: {
      type: String,
      default: '',
      maxlength: 200,
    },
    // timestamp
    lastMessageAt: {
      type: Date,
      default: null,
    },

    //  الرسائل غير المقروءة  
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    //إخفاء المحادثة
    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    //حالة المحادثة
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active',
    },
    // الابلاغ عن المحادثة
    isReported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ====================================INDEXES 

// البحث عن محادثة
ConversationSchema.index({ participants: 1 });
// ترتيب  المحادثات حسب آخر نشاط
ConversationSchema.index({ lastMessageAt: -1 });
// منع تكرار المحادثة بين نفس الشخصين + نفس البوست
ConversationSchema.index(
  { participants: 1, relatedPost: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);