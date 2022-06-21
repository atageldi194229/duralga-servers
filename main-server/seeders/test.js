const { Stop, Route } = require('../models');

(async () => {
    // const data = await Route.findOne({ where: { number: 102 } });
    const data = await Stop.findOne();

    console.log(JSON.stringify(data, null, 2));

    console.log("Done.");
    process.exit();
})();