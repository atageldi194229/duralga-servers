const { sequelize } = require("../models");

(async () => {
    console.log("Start");

    await sequelize.drop({ force: true });
    await sequelize.sync({ force: true });

    console.log("End.");
    process.exit();
})();