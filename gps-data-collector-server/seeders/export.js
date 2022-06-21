const { Tibs } = require('../models');
const fs = require('fs');

(async () => {
    const tibs = await Tibs.findAll();

    fs.writeFileSync('./tibs.json', JSON.stringify(tibs));

    console.log('Done.');
    process.exit(0);
})();