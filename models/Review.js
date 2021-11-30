const mongoose = require("mongoose");

const Review = mongoose.model("Review", {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  like: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  rank: Number,
  title: String,
  description: String,
  game: Object,
});
module.exports = Review;
