const express = require("express");
const router = express.Router();

const { createEntry, getEntries } = require("../controllers/moodController");

router.post("/create", createEntry);
router.get("/all", getEntries);

module.exports = router;