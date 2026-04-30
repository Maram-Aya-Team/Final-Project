const mongoose = require('mongoose');
const { Schema } = mongoose;

const QRSchema = new Schema(
  {
    //صاحب الكود
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    //البوست المرتبط بالكود
    linkedPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    // نوع الاستخدام
    purpose: {
      type: String,
      enum: ['item_tag', 'pet_tag', 'bag_tag', 'car_tag', 'general'],
      default: 'item_tag',
    },
    label: {
      type: String,
      maxlength: 100,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    scanCount: {
      type: Number,
      default: 0,
    },

    lastScannedAt: {
      type: Date,
      default: null,
    },
    // سجل المسحات (IP + timestamp + location )
    scanHistory: [
      {
        scannedAt: { type: Date, default: Date.now },
        ip: { type: String },
        location: {
          type: { type: String, enum: ['Point'] },
          coordinates: [Number],
        },
        scannedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          default: null, //null=anonymous
        },
      },
    ],
    emergencyContact: {
      name: String,
      phone: String,
      note: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

QRSchema.index({ code: 1 }, { unique: true });
QRSchema.index({ owner: 1, isActive: 1 });

module.exports = mongoose.model('QR', QRSchema);