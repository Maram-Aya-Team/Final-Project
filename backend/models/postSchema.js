const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["lost", "found"], required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    images: { type: [String], default: [] },
    city: {
      type: String,
      required: true,
      enum: ["Amman", "Irbid", "Zarqa", "Ajloun", "Jerash", "Mafraq", "Balqa", "Madaba", "Karak", "Tafilah", "Maan", "Aqaba"],
      index: true,
    },

    area: { type: String, required: true, trim: true },

    location: {
      address: { type: String, required: true, trim: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    // تاريخ الحدث
    itemDate: { type: Date, required: true, index: true },

    // المكافأة
    reward: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function (value) {
          if (this.type === "found") return value === 0;
          return true;
        },
        message: "Reward is only allowed for lost posts",
      },
    },

    // التواصل
    contactPhone: { type: String, trim: true, required: true },

    // الحالة
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "resolved"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// تحسين الأداء للـ Feed
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ city: 1, createdAt: -1 });

// نوع البوست للفرونت
postSchema.virtual("isLost").get(function () {
  return this.type === "lost";
});

// تنظيف الداتا قبل الإرسال
postSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

// حماية المكافأة
postSchema.pre("save", function (next) {
  if (this.type === "found" && this.reward !== 0) {
    this.reward = 0;
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);