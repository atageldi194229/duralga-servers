"use strict";
module.exports = (sequelize, DataTypes) => {
    const RouteStop = sequelize.define(
        "RouteStop",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },

            routeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                // references: {
                //     model: 'Routes',
                //     key: 'routeId'
                // }
            },
            stopId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                // references: {
                //     model: 'Stops',
                //     key: 'stopId'
                // }
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: [
                        "routeId",
                        "stopId",
                    ],
                },
            ],
            charset: "utf8",
            collate: "utf8_general_ci",
            timestamps: false,
        }
    );
    RouteStop.associate = function (models) {
        // associations
    };
    return RouteStop;
};
