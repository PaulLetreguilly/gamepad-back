const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/games", async (req, res) => {
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

router.get("/game/:slug", async (req, res) => {
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

router.get("/game/series/:slug", async (req, res) => {
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

module.exports = router;
