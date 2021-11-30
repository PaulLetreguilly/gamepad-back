const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ token: token }).select(
        "Collection email username token Reviews _id"
      );
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: "Unauthorized, didnt find user" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized, bad authorisation" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
    // console.log(error.message);
  }
};

module.exports = isAuthenticated;
