const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const app = express();
app.use(formidable());
app.use(cors());

const favorite = require("./routes/favorite");
const game = require("./routes/game");
const review = require("./routes/review");
const user = require("./routes/user");
app.use(favorite, game, review, user);

mongoose.connect(process.env.MONGODB_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useCreateIndex: true,
});

app.get("/", (req, res) => {
  res.send("Welcome here");
});

app.all("*", (req, res) => {
  res.status(404).send("page not found");
});
app.listen(process.env.PORT || 4000, (req, res) => {
  console.log("Server started");
});
