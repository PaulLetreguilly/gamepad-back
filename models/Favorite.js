const mongoose = require("mongoose");

const Favorite = mongoose.model("Favorite", {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  game: Object,
});

module.exports = Favorite;
