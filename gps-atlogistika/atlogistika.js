var axios = require("axios");
var fs = require("fs");

const filepath = "./atlogistika.json";

var config = {
  method: "get",
  url: process.env.ATLOGISTIKA_API,
  auth: {
    username: process.env.ATLOGISTIKA_USER,
    password: process.env.ATLOGISTIKA_PASS,
  },
};

function loadData() {
  return axios(config).then((res) => {
    if (res.data.code !== 0) return; // throw error;
    if (res.data.msg !== "OK") return; // throw error;
    if (!res.data.list) return; // throw error;
    if (!res.data.list.length) return; // throw error;

    const data = {
      updated_at: new Date().getTime() / 1000,
      list: res.data.list,
    };

    fs.writeFileSync(filepath, JSON.stringify(data));

    return;
  });
}

const sleep = (time) => {
  // time in ms
  return new Promise((resolve) => setTimeout(resolve, time));
};

const start = async () => {
  while (true) {
    try {
      console.log("load started");
      await loadData();
      console.log("load done");
      await sleep(50000);
    } catch (err) {
      // console.error(err);
    }
  }
};

module.exports = start;

// start();

/*

{
  "agentid": 3059,
  "veh_id": 3059,
  "imei": "860906040546399",
  "typeid": 6,
  "type": "Bus",
  "model": "Hyundai",
  "vehiclenumber": "60-71 AGB",
  "folder": "1-nji awtotoplum",
  "created_time": 1651551803,
  "current_mileage": 3892,
  "driver_name": null,
  "driver_phone": null,
  "info": "",
  "status": {
    "unixtimestamp": "1652206471",
    "lat": "38.040432",
    "lon": "58.401893",
    "speed": 0,
    "dir": 40,
    "alt": 208,
    "satsinview": 15
  },
  "sensors": [
    {
      "name": "Датчик зажигания",
      "description": "Датчик зажигания"
    }
  ],
  "sensors_status": [
    {
      "name": "Датчик зажигания",
      "id": "11607",
      "hum_value": "вкл.",
      "dig_value": "1",
      "raw_value": null,
      "change_ts": "1651551663",
      "group": ""
    }
  ]
},

*/
