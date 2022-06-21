const { Tibs } = require('../models');
const tibs = require('./tibs.json');

(async () => {
    await Tibs.bulkCreate(tibs);
    console.log('Done.');
    process.exit(0);
})();