"use strict";
module.exports = (sequelize, DataTypes) => {
    const Stop = sequelize.define(
        "Stop",
        {
            stopId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: 'stopId',
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            location: {
                type: DataTypes.JSON,
                // type: DataTypes.STRING(50),
                allowNull: false,

                // get: function () {
                //     return JSON.parse(this.getDataValue('location'));
                // },

                // set: function (value) {
                //     return this.setDataValue('location', JSON.stringify(value));
                // },
            },

            endpoint: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {
            //   indexes: [
            //     {
            //       unique: true,
            //       fields: [
            //         "bus",
            //       ],
            //     },
            //   ],
        }
    );
    Stop.associate = function (models) {
        // Stop.belongsToMany(models.Route, {
        //     as: 'routes',
        //     through: {
        //         model: "RouteStop",
        //         unique: false,
        //     },
        //     foreignKey: "routeId",
        // });
    };
    return Stop;
};
