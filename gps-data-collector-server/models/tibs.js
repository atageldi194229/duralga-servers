// Time Interval Between Stops TIBS
"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tibs = sequelize.define(
    "Tibs",
    {
      stop_a: DataTypes.INTEGER,
      stop_b: DataTypes.INTEGER,
      time_diff: DataTypes.FLOAT,
      time_slice: {
        type: DataTypes.INTEGER,
        comment:
          "one day(24 hours) sliced into 288 parts, and it defines which part is it",
      },

      bus: DataTypes.STRING,
      day_of_the_week: DataTypes.INTEGER,
      date: DataTypes.DATEONLY,

      // weather data
      min_temperature: DataTypes.INTEGER,
      max_temperature: DataTypes.INTEGER,
      visibility: {
        type: DataTypes.FLOAT,
        comment: "in KM",
      },
      weather_condition: {
        type: DataTypes.STRING,
        comment: "Weather conditions: rain, snow, fog or haze",
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: [
            "stop_a",
            "stop_b",
            "time_slice",
            "date",
            "bus",
          ],
        },
      ],
    }
  );
  Tibs.associate = function (models) {
    // Tibs.hasMany(models.FavoritePotatoes, {
    //   as: 'FavoritePotatoes',
    //   foreignKey: 'userid'
    // })
  };
  return Tibs;
};
