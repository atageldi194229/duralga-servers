var express = require('express');
var router = express.Router();

const { Tibs, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

router.get('/', async (req, res) => {
    // const ans = await Tibs.findAndCountAll({ limit: 2 });

    const data = await Tibs.findAll({ 
        group: ['stop_a', 'stop_b'],
        attributes: [
            'stop_a',
            'stop_b',
            [sequelize.fn('AVG', sequelize.col('time_diff')), 'time_diff'],
            [sequelize.fn('COUNT', sequelize.col('*')), 'count'],
        ],
    });
    
    res.json({ data });
});

router.post('/filtered', async (req, res) => {
    const { stops } = req.body;
    // const ans = await Tibs.findAndCountAll({ limit: 2 });

    const data = await Tibs.findAll({ 
        group: ['stop_a', 'stop_b'],
        attributes: [
            'stop_a',
            'stop_b',
            [sequelize.fn('AVG', sequelize.col('time_diff')), 'time_diff'],
            [sequelize.fn('COUNT', sequelize.col('*')), 'count'],
        ],

        where: {
            [Op.or]: stops.map(([a, b]) => ({
                stop_a: a,
                stop_b: b,
            })),
        },
    });
    
    const generateKey = (e) => e.stop_a.toString() + '-' + e.stop_b.toString();

    res.json(data.reduce((last, e) => (last[generateKey(e)] = e.time_diff) && last, {}));
});

router.post('/', async (req, res) => {
    console.log("New data received");
    
    const body = req.body;

    // stop_a
    // stop_b
    // time_diff
    // time_slice 288
    // bus
    // day_of_the_week
    // date

    for (let row of body) {
        await Tibs.create(row).catch(() => console.error(('='.repeat(40))+ 'dublicate'));
    }
    
    res.sendStatus(200);
});



module.exports = router;