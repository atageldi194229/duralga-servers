// Time Interval Between Stops GpsHistory
"use strict";

const { set } = require("express/lib/response");

module.exports = (sequelize, DataTypes) => {
  const GpsHistory = sequelize.define(
    "GpsHistory",
    {
      time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(50),
        allowNull: false,
        
        get: function () {
          return JSON.parse(this.getDataValue('location'));
        },

        set: function (value) {
          return this.setDataValue('location', JSON.stringify(value));
        },
        // const point = { type: 'Point', coordinates: [39.807222,-76.984722]};
      },
      messageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      // options
    }
  );
  GpsHistory.associate = function (models) {
    // GpsHistory.hasMany(models.FavoritePotatoes, {
    //   as: 'FavoritePotatoes',
    //   foreignKey: 'userid'
    // })
  };
  return GpsHistory;
};
