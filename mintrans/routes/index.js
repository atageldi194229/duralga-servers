const axios = require("axios");
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const router = express.Router();

const url = process.env.DATA_API;
const time_interval = 5 * 60 * 1000;
var data = [];
var data_map = {};

const sleep = (ms_time) =>
  new Promise((resolve) => setTimeout(resolve, ms_time));

const recursive_data_collect = async () => {
  while (true) {
    try {
      const res = await axios.get(url);
      data = res.data.map((e) => ({
        ...e,
        number: parseInt(e.number),
        change: parseInt(e.change),
      }));

      for (let row of data) {
        if (!data_map[row.number]) data_map[row.number] = [];
        data_map[row.number].push(row);
      }

      console.log("Got data. Time: " + new Date().toLocaleString());
      await sleep(5 * 60 * 1000);
    } catch (err) {
      console.error(err.message);
      await sleep(30 * 1000);
    }

    // setInterval(recursive_data_collect, time_interval);
  }
};
// first start of recursive function
recursive_data_collect();

router.get(
  "/bus-info",
  expressAsyncHandler(async (req, res, next) => {
    res.json(data);
  })
);

router.get(
  "/bus-info/:numero",
  expressAsyncHandler(async (req, res, next) => {
    const number = parseInt(req.params.numero);

    res.json(data_map[number]);
  })
);

router.post(
  "/bus-info/",
  expressAsyncHandler(async (req, res, next) => {
    let { numeros } = req.body;

    numeros = numeros.map((e) => parseInt(e));

    res.json(data.filter((e) => numeros.includes(e.number)));
  })
);

module.exports = router;
