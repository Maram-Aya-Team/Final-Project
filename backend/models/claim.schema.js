const mongoose = require("mongoose");
const claimSchema = new mongoose.Schema(
  {
    // الشخص اللي بقدم المطالبة
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    // صاحب البوست الأصلي
    postOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // كيف بيثبت إنه صاحب الغرض
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1500,
    },
    // صور/أدلة إثبات
    proofImages: {
      type: [String],
      default: [],
    },
    // أسئلة تحقق 
    verificationAnswers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    // حالة المطالبة
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    // ملاحظات صاحب البوست أو الادمن
    reviewNote: {
      type: String,
      maxlength: 500,
      default: "",
    },
    // وقت مراجعة الطلب
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
// منع تكرار مطالبة لنفس الشخص على نفس البوست
claimSchema.index(
  { post: 1, claimant: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending"] },
    },
  }
);
claimSchema.index({ post: 1, status: 1, createdAt: -1 });
claimSchema.index({ claimant: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Claim", claimSchema);