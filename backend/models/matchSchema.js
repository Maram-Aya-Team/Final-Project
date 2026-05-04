const mongoose =require ("mongoose");

const matchSchema=new mongoose.Schema({
    lostItem:{type:mongoose.Schema.Types.ObjectId, ref:"LostItem", required:true},
    foundItem:{type:mongoose.Schema.Types.ObjectId, ref:"FoundItem", required:true},
    score:{type: Number, default: 0, min: 0, max: 100},
    status:{type: String, enum:["suggested", "accepted", "rejected"], default:"suggested"},
}, {timestamps:true});

module.exports=mongoose.model("Match", matchSchema);