"use strict";
module.exports = (sequelize, DataTypes) => {
    const Route = sequelize.define(
        "Route",
        {
            routeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: "routeId",
            },

            number: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: "number",
            },
            
            // description: {
            //     type: DataTypes.STRING,
            //     allowNull: false,

            //     get: function () {
            //         return JSON.parse(this.getDataValue('description'))
            //     },

            //     set: function (value) {
            //         return this.setDataValue('description', JSON.stringify(value));
            //     },
            // },

            description: DataTypes.JSON,
            
            start_coords: DataTypes.JSON,
            end_coords: DataTypes.JSON,

            start_stops: DataTypes.JSON,
            end_stops: DataTypes.JSON,
        },
        {
            //   indexes: [
            //     {
            //       unique: true,
            //       fields: [
            //         "number",
            //       ],
            //     },
            //   ],
        }
    );
    Route.associate = function (models) {
        // Route.belongsToMany(models.Stop, {
        //     as: "stops",
        //     through: {
        //       model: "RouteStop",
        //       unique: false,
        //     },
        //     foreignKey: "routeId",
        //     constraints: false,
        //   });
    };
    return Route;
};
