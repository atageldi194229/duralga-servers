const path = require("path");
const expressAsyncHandler = require('express-async-handler');
const { Route, Stop } = require('../../models');
const { arrivalTime } = require('../../services/arrivalTime');
/***
 * Arrival time of buses using bus stop id
 * method: get
 * url: /api/bus-arrival-time/stop/:stopId
 */
exports.arrivalTimeByStopId = expressAsyncHandler(async (req, res, next) => {
    const stopId = parseInt(req.params.stopId);

    const result = await arrivalTime(stopId);

    res.status(200).json({ stopId, arrivalTime: result });
});