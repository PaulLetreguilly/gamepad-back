const mongoose = require("mongoose");

const User = mongoose.model("User", {
  username: {
    type: String,
    default: "",
  },
  email: { type: String, unique: true },
  image: { type: mongoose.Schema.Types.Mixed, default: {} },
  Collection: [{ ref: "Favorite", type: mongoose.Schema.Types.Mixed }],
  Reviews: [{ ref: "Review", type: mongoose.Schema.Types.ObjectId }],
  salt: String,
  token: String,
  hash: String,
});

module.exports = User;
