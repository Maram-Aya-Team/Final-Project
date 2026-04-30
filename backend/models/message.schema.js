const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    // المحادثة الي تنتمي الها الرسالة
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    // المرسِل
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // نص الرسالة
    content: {
      type: String,
      maxlength: 2000,
      trim: true,
    },
    // نوع الرسالة
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'location', 'system'],
      default: 'text',
    },
    // Upload schema
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Upload',
      },
    ],
    // للرسائل اللي فيها location
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
       //[longitude, latitude]
      coordinates: [Number],
    },
    // حالة القراءة — Map:userId=>timestamp
    readBy: {
      type: Map,
      of: Date,
      default: {},
    },
    //هل تم حذف الرسالة 
    isDeleted: {
      type: Boolean,
      default: false,
    },
    //نص الرسالة الأصلي بعد الحذف يتم استبداله
    deletedAt: {
      type: Date,
      default: null,
    },
    // الرد على رسالة معينة
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    isReported: {
      type: Boolean,
      default: false,
    },

    seq: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//========================INDEXES

MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ conversation: 1, seq: -1 });
MessageSchema.index({ conversation: 1, isDeleted: 1 });

module.exports = mongoose.model('Message', MessageSchema);