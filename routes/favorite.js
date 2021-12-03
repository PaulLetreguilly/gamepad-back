const express = require("express");
const router = express.Router();

const Favorite = require("../models/Favorite");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/create/favorite", isAuthenticated, async (req, res) => {
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

router.get("/get/favorite", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
router.post("/delete/favorite", isAuthenticated, async (req, res) => {
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

module.exports = router;
