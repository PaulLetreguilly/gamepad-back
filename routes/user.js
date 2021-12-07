const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    // console.log("test body : ", req.fields);

    if (user) {
      res.status(409).json({ message: "This email already has an account" });
    } else {
      if (req.fields.question && req.fields.answer) {
        if (req.fields.email && req.fields.password && req.fields.username) {
          // console.log(req.fields);
          // console.log(req.files);
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
            security: {
              question: req.fields.question,
              answer: req.fields.answer,
            },
          });

          const bodyToReturn = {
            _id: user._id,
            token: user.token,
            username: user.username,
          };
          // console.log(req.files);
          if (req.files.files) {
            console.log(req.files);
            //   console.log("pic path : ", req.files.files.path);
            const pictureToUpload = await cloudinary.uploader.upload(
              req.files?.files.path,
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
          bodyToReturn.security = {
            question: req.fields.question,
            answer: req.fields.answer,
          };

          await user.save();

          res.status(200).json(bodyToReturn);
        } else {
          res.status(400).json({ error: "Missing parameters" });
        }
      } else {
        res
          .status(400)
          .json({ message: "Choose a question and answer it please" });
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
    if (user) {
      user.populate("Collection");
    }
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
      console.log("username :", req.fields.username);
      user.username = req.fields.username;
      console.log("user ===>", user);
      user.markModified("username");
    }
    if (req.fields.email) {
      console.log("email :", req.fields.email);
      user.email = req.fields.email;
      user.markModified("email");
    }
    if (req.fields.password) {
      console.log("password :", req.fields.password);
      user.hash = SHA256(req.fields.password + user.salt).toString(encBase64);
      user.markModified("hash");
    }
    // console.log("files :", req.files);
    if (req.files.files) {
      console.log("files :", req.files);
      const picToUpload = await cloudinary.uploader.upload(
        req.files.files.path,
        //   "gamepad_upload",
        {
          folder: `gamepad/user-image/${user._id}`,
          public_id: "preview",
        }
      );
      user.image = picToUpload;
      user.markModified("image");
    }
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/password", async (req, res) => {
  if (req.fields.question && req.fields.answer) {
    // console.log("body :", req.fields);
    const user = await User.findOne({ email: req.fields.yourEmail });
    // console.log(user.security);
    const secure = {
      question: req.fields.question.name,
      answer: req.fields.answer,
    };
    // console.log(secure);
    if (
      user.security.question === secure.question &&
      user.security.answer === secure.answer
    ) {
      if (req.fields.password) {
        // console.log("password :", req.fields.password);
        const newHash = SHA256(req.fields.password + user.salt).toString(
          encBase64
        );
        if (user.hash === newHash) {
          res
            .status(400)
            .json({ message: "New password must be different from old one" });
        } else {
          user.hash = newHash;
          user.markModified("hash");
          await user.save();
          const body = {
            _id: user._id,
            token: user.token,
            username: user.username,
          };
          if (user.image) {
            body.image = user.image;
          }
          res.status(200).json(body);
        }
      }
    } else {
      res.status(400).json({ message: "wrong question/answer" });
    }
  } else {
    res
      .status(400)
      .json({ message: "Choose your security question and answer it please" });
  }
});

module.exports = router;
