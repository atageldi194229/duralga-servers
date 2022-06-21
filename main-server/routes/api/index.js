const express = require("express");
const router = express.Router();

router.use("/duralga", require("./duralga"));
router.use("/arrival", require("./arrival"));

module.exports = router;