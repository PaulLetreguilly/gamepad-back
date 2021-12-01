const express = require("express");
const formidable = require("express-formidable");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
require("dotenv").config();

const app = express();
app.use(formidable());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome here");
});

mongoose.connect(process.env.MONGODB_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useCreateIndex: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const User = require("./models/User");
const Review = require("./models/Review");
const Favorite = require("./models/Favorite");
const isAuthenticated = require("./middleware/isAuthenticated");

app.get("/games", async (req, res) => {
  try {
    let body = { key: process.env.API_KEY };
    // console.log(req.query);
    if (req.query.page) {
      body.page = req.query.page;
    }
    if (req.query.page_size) {
      body.page_size = req.query.page_size;
    }
    if (req.query.search) {
      body.search = req.query.search;
    }
    if (req.query.sort) {
      body.ordering = req.query.sort;
    }
    if (req.query.platform) {
      body.platforms = req.query.platform;
    }
    if (req.query.type) {
      body.genres = req.query.type;
    }

    const response = await axios.get(`https://api.rawg.io/api/games`, {
      params: body,
    });
    // console.log(response.data);
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
    // res.send("not ok");
    console.log(error.message);
    // console.log("AH", error.response.data.error);
  }
});

app.get("/game/:slug", async (req, res) => {
  try {
    // console.log(req.params.id);
    const resp = await axios.get(
      `https://api.rawg.io/api/games/${req.params.slug}?key=${process.env.API_KEY}`
    );
    // console.log(resp.data);
    res.status(200).json(resp.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/game/series/:slug", async (req, res) => {
  try {
    // console.log("params ===> ", req.params);
    const response = await axios.get(
      `https://api.rawg.io/api/games/${req.params.slug}/game-series?key=${process.env.API_KEY}`
    );
    // console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// app.post("/reviews/get", async (req, res)=>{
//     try {

//     } catch (error) {
//         res.status(400).json({error:error.message})
//     }
// })

app.post("/signup", async (req, res) => {
  try {
    // console.log("second test log");
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      res.status(409).json({ message: "This email already has an account" });
    } else {
      //   console.log("third test log");
      if (req.fields.email && req.fields.password && req.fields.username) {
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(req.fields.password + salt).toString(encBase64);
        const user = new User({
          email: req.fields.email,
          username: req.fields.username,
          password: req.fields.password,
          hash: hash,
          salt: salt,
          token: token,
          //   to be continued.....
        });
        // if (req.files.path) {
        // console.log("pic : ", req.files.files.path);
        // const pictureToUpload = await cloudinary.uploader.unsigned_upload(
        //   req.files.files.path,
        //   //   "gamepad_upload",
        //   {
        //     folder: `api/gamepad/user-image/${user._id}`,
        //     public_id: "preview",
        //   }
        // );
        // user.image = pictureToUpload;
        // }

        await user.save();
        // res.send("fourth test log");

        res.status(200).json({
          _id: user._id,
          token: user.token,
          username: user.username,
          //   image: user.image, //   to be continued....
        });
      } else {
        res.status(400).json({ error: "Missing parameters" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      if (
        SHA256(req.fields.password + user.salt).toString(encBase64) ===
        user.hash
      ) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          username: user.username,
          // image:user.image             to be continued....
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/user", async (req, res) => {
  try {
    // console.log("query", req.query._id);
    const user = await User.findById(req.query.id);
    user.populate("Collection");
    // console.log(user);
    // console.log(user.Collection);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post("/create/favorite", isAuthenticated, async (req, res) => {
  //   const checkFavorite = await Favorite.findOne({
  //     user: req.fields.user,
  //     game: req.fields.game,
  //   });
  const user = req.user;

  const favorite = new Favorite({
    user: user._id,
    game: req.fields.game,
  });
  // console.log(favorite);
  user.Collection.push(favorite);
  await favorite.save();
  await user.save();
  res.status(200).send("favoris crée");

  //   res.send("Data received");
});

app.get("/get/favorite", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
app.post("/delete/favorite", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const favorite = await Favorite.findOne({
      "game.id": req.fields.game.id,
      user: user._id,
    });
    user.Collection = user.Collection.filter(
      (fav) => fav.game.id !== req.fields.game.id
    );
    user.markModified("Collection");
    await favorite.delete();
    await user.save();
    res.status(200).send("Favorite updated");
    console.log("done");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/game/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({
      "game.slug": req.fields.slug,
    }).populate("user");
    // console.log(reviews);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/create/review", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields);
    const user = req.user;
    const review = new Review({
      user: user._id,
      title: req.fields.title,
      description: req.fields.text,
      game: req.fields.game,
    });
    // console.log(review);
    user.Reviews.push(review);
    await review.save();
    await user.save();
    res.send("review created");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/review/like", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields.game.id);
    const user = req.user;
    const review = await Review.findById(req.fields.id);

    const liked = { user: user };
    review.like.push(liked);
    // console.log(review.like);
    await review.save();
    res.send("like registered");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post("/review/unlike", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const review = await Review.findById(req.fields.id);
    const arr = [];
    for (let i = 0; i < review.like.length; i++) {
      if (review.like[i].user.email !== req.fields.user) {
        // console.log("different");
        arr.push(review.like[i]);
      }
    }
    review.like = arr;
    // console.log("after filter ==>", review.like);
    review.markModified("like");
    await review.save();
    res.status(200).send("like updated");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post("/review/dislike", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const review = await Review.findById(req.fields.id);
    const disliked = { user: user };
    review.dislike.push(disliked);
    await review.save();
    res.status(200).send("dislike registered");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post("/review/undislike", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const review = await Review.findById(req.fields.id);
    const arr = [];
    for (let i = 0; i < review.dislike.length; i++) {
      if (review.dislike[i].user.email !== req.fields.user) {
        arr.push(review.dislike[i]);
      }
    }
    review.dislike = arr;
    review.markModified("dislike");
    await review.save();
    res.status(200).send("dislike updated");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(404).send("page not found");
});
app.listen(process.env.PORT || 4000, (req, res) => {
  console.log("Server started");
});
