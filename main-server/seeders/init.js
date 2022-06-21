const { sequelize } = require('../models');

(async () => {
    await sequelize.drop({ sync:true });
    await sequelize.sync({ sync:true });

    console.log("Done.");
    process.exit();
})();