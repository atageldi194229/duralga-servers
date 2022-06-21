const express = require("express");
const router = express.Router();
const {
    getJsonFile,
    getAllData,
    getDataByTime,
} = require("../../controllers/api/duralga");

router.get('/json', getJsonFile);
router.get('/data', getAllData);
router.get('/data/:time', getDataByTime);

module.exports = router;