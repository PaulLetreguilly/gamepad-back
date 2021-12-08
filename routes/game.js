const express = require("express");
const router = express.Router();
const axios = require("axios");
// const games = require("../games.json");

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
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(200).json(response.data);
    // res.json({ related: { results: [{}] } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/games/platforms", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.rawg.io/api/platforms?key=${process.env.API_KEY}&page_size=51`
    );
    res.status(200).json(response.data);
    // res.json(games.platforms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/games/genres", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.rawg.io/api/genres?key=${process.env.API_KEY}`
    );
    res.status(200).json(response.data);
    // res.json(games.genres);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
