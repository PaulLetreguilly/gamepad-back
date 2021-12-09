const mongoose = require("mongoose");

const Review = mongoose.model("Review", {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  like: [{ type: mongoose.Schema.Types.Mixed, ref: "User" }],
  dislike: [{ type: mongoose.Schema.Types.Mixed, ref: "User" }],
  rank: Number,
  title: String,
  description: String,
  game: Object,
  comments: [{ type: mongoose.Schema.Types.Mixed, ref: "User" }],
  // comments: [{ Object }],
});
module.exports = Review;
