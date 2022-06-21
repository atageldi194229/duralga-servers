const express = require("express");
const router = express.Router();
const {
    arrivalTimeByStopId,
} = require("../../controllers/api/arrivalTime");

router.get('/stop/:stopId', arrivalTimeByStopId);

module.exports = router;