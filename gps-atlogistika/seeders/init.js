const { sequelize } = require('../models');

(async () => {
    await sequelize.drop({ force: true });
    await sequelize.sync({ force: true });

    console.log("Done.");
    process.exit();
})();