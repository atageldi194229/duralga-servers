var express = require("express");
var router = express.Router();

router.use("/tibs", require("./tibs.router.js"));

module.exports = router;
