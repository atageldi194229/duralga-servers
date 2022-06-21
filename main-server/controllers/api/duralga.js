const path = require("path");
const expressAsyncHandler = require('express-async-handler');
const { Route, Stop, Sequelize: { Op } } = require('../../models');

exports.getJsonFile = expressAsyncHandler(async (req, res, next) => {
    res.header("Content-Type",'application/json');
    res.sendFile(path.join(__dirname, '../../public/duralga.json'));
});

exports.getAllData = expressAsyncHandler(async (req, res, next) => {
    const stops = await Stop.findAll({ attributes: { exclude: ['createdAt', 'updatedAt'] }});
    const routes = await Route.findAll({ attributes: { exclude: ['createdAt', 'updatedAt'] }});

    res.status(200).json({ stops, routes });
});

/**
 * get all data by time
 * url - /api/duralga/data/:time
 * method - get
 */
exports.getDataByTime = expressAsyncHandler(async (req, res, next) => {
    let { time } = req.params;
    time = new Date(parseInt(time));

    // options
    const where = {
        [Op.or]: [
            { updatedAt: { [Op.gte]: time }, },
        ],
    };
    const attributes = { exclude: ['createdAt'] };

    const stops = await Stop.findAll({ where, attributes });
    const routes = await Route.findAll({ where, attributes });

    res.status(200).json({ stops, routes });
});