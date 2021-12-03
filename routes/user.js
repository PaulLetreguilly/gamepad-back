const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    // console.log("test body : ", req.fields);

    if (user) {
      res.status(409).json({ message: "This email already has an account" });
    } else {
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
        });

        const bodyToReturn = {
          _id: user._id,
          token: user.token,
          username: user.username,
        };

        if (req.files.files.path) {
          //   console.log("pic path : ", req.files.files.path);
          const pictureToUpload = await cloudinary.uploader.upload(
            req.files.files.path,
            //   "gamepad_upload",
            {
              folder: `gamepad/user-image/${user._id}`,
              public_id: "preview",
            }
          );
          //   console.log("pic registered :", pictureToUpload);
          bodyToReturn.image = pictureToUpload;
          user.image = pictureToUpload;
        }

        await user.save();

        res.status(200).json(bodyToReturn);
      } else {
        res.status(400).json({ error: "Missing parameters" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
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
          image: user.image,
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

router.get("/user", async (req, res) => {
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

router.post("/user/update", isAuthenticated, async (req, res) => {
  try {
    console.log("route update :", req.fields);
    const user = req.user;
    if (req.fields.username) {
      user.username = req.fields.username;
    }
    if (req.fields.email) {
      user.email = req.fields.email;
    }
    if (req.fields.password) {
      user.hash = SHA256(req.fields.password + user.salt).toString(encBase64);
    }
    if (req.files?.files?.path) {
      const picToUpload = await cloudinary.uploader.upload(
        req.files.files.path,
        //   "gamepad_upload",
        {
          folder: `gamepad/user-image/${user._id}`,
          public_id: "preview",
        }
      );
      user.image = picToUpload;
    }
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
