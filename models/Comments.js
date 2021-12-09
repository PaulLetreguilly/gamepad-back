const mongoose = require("mongoose");

const Comments = mongoose.model("Comments", {
  user: {
    type: mongoose.Schema.Types.Mixed,
    ref: "User",
  },
  //   like: [{ type: mongoose.Schema.Types.Mixed, ref: "User" }],
  //   dislike: [{ type: mongoose.Schema.Types.Mixed, ref: "User" }],
  //   rank: Number,
  //   title: String,
  message: String,
  //   review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
});
module.exports = Comments;
