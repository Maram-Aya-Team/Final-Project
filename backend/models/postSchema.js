const mongoose = require("mongoose");
const MS_PER_HOUR = 3_600_000;
const JORDAN_CITIES = ["Amman", "Irbid", "Zarqa", "Ajloun", "Jerash", "Mafraq", "Balqa", "Madaba", "Karak", "Tafilah", "Maan", "Aqaba"];
const commentSchema = new mongoose.Schema(
  {
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String, required: true, trim: true, maxlength: 1000},
  },
  {_id: true, timestamps: {createdAt: true, updatedAt: false}}
);
const postSchema = new mongoose.Schema(
  {
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true},
    type: {type: String, enum: ["lost", "found"], required: true, index: true},
    title: {type: String, required: true, trim: true, minlength: 3, maxlength: 100},
    description: {type: String, required: true, trim: true, minlength: 10, maxlength: 1000},
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true},
    images: {type: [String], default: []},
    itemDate: {type: Date, required: true, index: true}, // تاريخ الفقدان أو اللقية
    city: {type: String, required: true, trim: true, enum: JORDAN_CITIES, index: true},
    area: {type: String, required: true, trim: true},
    location: {
      type: {type: String, enum: ["Point"], default: "Point"},
      coordinates: {type: [Number], required: true}, // الترتيب مهم للماب
      address: {type: String, trim: true},
    },
    reward: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function(v) {return this.type === "found" ? v === 0 : true;},
        message: "Reward is only allowed for lost posts",
      },
    },
    contactPhone: {type: String, required: true, trim: true},
    status: {type: String, enum: ["pending", "approved", "rejected", "resolved"], default: "pending", index: true},
    isResolved: {type: Boolean, default: false, index: true},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    likesCount: {type: Number, default: 0, min: 0},
    comments: {type: [commentSchema], default: []},
    commentsCount: {type: Number, default: 0, min: 0},
    viewsCount: {type: Number, default: 0, min: 0},
    rankScore: {type: Number, default: 0, index: true},
    lastActivityAt: {type: Date, default: Date.now, index: true},
  },
  {timestamps: true, versionKey: false}
);
postSchema.index({location: "2dsphere"});
postSchema.index({createdAt: -1});
postSchema.index({status: 1, createdAt: -1});
postSchema.index({city: 1, createdAt: -1});
postSchema.index({status: 1, isResolved: 1, rankScore: -1, _id: -1});
postSchema.index({user: 1, createdAt: -1});
postSchema.virtual("isLost").get(function() {return this.type === "lost";});
postSchema.virtual("isFound").get(function() {return this.type === "found";});
postSchema.set("toJSON", {virtuals: true});
postSchema.pre("save", function(next) {
  if (this.type === "found") this.reward = 0; // اللي بلاقي غرض ما اله مكافأة
  const interactionChanged = this.isNew || this.isModified("likes") || this.isModified("comments");
  const shouldRecomputeRank = interactionChanged || this.isModified("createdAt") || this.isModified("type");
  if (interactionChanged) {
    this.likesCount = this.likes.length;
    this.commentsCount = this.comments.length;
    this.lastActivityAt = new Date();
  }
  if (shouldRecomputeRank) this.rankScore = this.computeRankScore();
  next();
});
postSchema.methods.computeRankScore = function() {
  const createdAtMs = this.createdAt ? new Date(this.createdAt).getTime() : Date.now();
  const ageHours = Math.max(1, (Date.now() - createdAtMs) / MS_PER_HOUR);
  const recencyScore = Math.max(0, 100 - ageHours * 0.5); // البوست القديم بموت
  const engagementScore = this.likesCount * 2 + this.commentsCount; // اللايك والكومنت برفعوه
  const typePriority = this.type === "lost" ? 20 : 0; // المفقود اله أولوية عاللقية
  return Math.round(recencyScore + engagementScore + typePriority);
};
module.exports = mongoose.model("Post", postSchema);