const express = require("express");
const router = express.Router();

const { runCode } = require("../controllers/runController");

// Run Code Endpoint
router.post("/run", runCode);

module.exports = router;
