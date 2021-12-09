const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middleware/isAuthenticated");
// const { findOne, findById } = require("../models/Review");
const Review = require("../models/Review");
const Comments = require("../models/Comments");

router.post("/game/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({
      "game.slug": req.fields.slug,
    })
      .populate("user")
      .sort({ rank: -1 });
    // console.log(reviews);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/create/review", isAuthenticated, async (req, res) => {
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

router.post("/review/like", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields.game.id);
    const user = req.user;
    const review = await Review.findById(req.fields.id);

    const liked = { user: user };
    review.like.push(liked);
    review.rank = review.like.length - review.dislike.length;
    // console.log(review.like);
    await review.save();
    res.send("like registered");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/review/unlike", isAuthenticated, async (req, res) => {
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
    review.rank = review.like.length - review.dislike.length;
    review.markModified("like");
    await review.save();
    res.status(200).send("like updated");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/review/dislike", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const review = await Review.findById(req.fields.id);
    const disliked = { user: user };
    review.dislike.push(disliked);
    review.rank = review.like.length - review.dislike.length;
    await review.save();
    res.status(200).send("dislike registered");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/review/undislike", isAuthenticated, async (req, res) => {
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
    review.rank = review.like.length - review.dislike.length;
    review.markModified("dislike");
    await review.save();
    res.status(200).send("dislike updated");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/review/:id/comments", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const review = await Review.findById(req.params.id);
    const comment = new Comments({
      user: user,
      message: req.fields.message,
    });
    comment.populate("user");
    review.comments.push(comment);

    await comment.save();
    await review.save();
    res.json(review.comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
