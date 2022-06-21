const { pnt2line } = require("./vectors");
const { Route, Stop, RouteStop } = require("../models");
const axios = require("axios");

const GET_BUS_INFO_ROUTE = "http://localhost:3052/bus-info";
const GET_UNITS_BY_BUS_NUMBER = "http://localhost:3050/unit-ids";
const GET_LAST_MESSAGES_OF_UNITS = "http://localhost:3050/units";
const GET_TIME_INTERVALS_FILTERED = "http://localhost:8788/tibs/filtered";

/**
 *
 * @param {Array<Array(2)>} stops
 * @returns Object
 */
const getTimeIntervalOfPairStops = async (stops) => {
  const res = await axios.post(GET_TIME_INTERVALS_FILTERED, { stops });
  return res.data;
};

const getRouteNumbersByStopId = async (stopId) => {
  const rels = await RouteStop.findAll({ where: { stopId } });

  const routeIds = rels.map((e) => e.routeId);

  const routes = await Route.findAll({
    where: { routeId: routeIds },
    attributes: ["number"],
  });

  return routes.map((e) => e.number);
};

const getBusNumbersByRouteNumbers = async (routeNumbers) => {
  const res = await axios.post(GET_BUS_INFO_ROUTE, { numeros: routeNumbers });

  // const busNumbers = res.data.reduce((last, e) => (last[e.number] = e) && last, {});
  // return busNumbers;

  const NOW = new Date();

  let data = res.data.reduce((last, e) => {
    if (last[e.car_number]) {
      if (
        (NOW.getHours() < 12 && e.change == 1) ||
        (NOW.getHours() >= 12 && e.change == 2)
      ) {
        last[e.car_number] = e;
      }
    } else {
      last[e.car_number] = e;
    }

    return last;
  }, {});

  return Object.values(data);
};

const getUnitIdsByBusNumbers = async (busNumbers) => {
  const res = await axios.post(GET_UNITS_BY_BUS_NUMBER, {
    car_numbers: busNumbers,
  });

  return res.data.units;
};

const getLastMessagesOfUnits = async (unitIds) => {
  const res = await axios.post(GET_LAST_MESSAGES_OF_UNITS, { unitIds });

  return res.data;
};

const getLastMessagesOfBuses = async (car_numbers) => {
  const res = await axios.post(GET_LAST_MESSAGES_OF_UNITS, { car_numbers });

  return res.data.units;
};

async function findTimeArrival(stopIds, destinationStopId, location) {
  const found = stopIds.find((e) => e == destinationStopId);
  if (!found) return null;

  let stops = [];

  for (let stopId of stopIds) {
    const stop = await Stop.findOne({ where: { stopId } });
    stops.push(stop);
  }

  let arr = [];

  for (let i = 1; i < stops.length; i++) {
    const precision = 100000;

    let a = {
      x: Number(stops[i - 1].location[1]) * precision,
      y: Number(stops[i - 1].location[0]) * precision,
    };

    let b = {
      x: Number(stops[i].location[1]) * precision,
      y: Number(stops[i].location[0]) * precision,
    };

    let c = {
      x: Number(location[0]) * precision,
      y: Number(location[1]) * precision,
    };

    let ac = distanceBetweenTwoPoints(a, c);
    let bc = distanceBetweenTwoPoints(b, c);

    arr.push({
      stop_a_id: stops[i - 1].stopId,
      stop_b_id: stops[i].stopId,
      ac,
      bc,
      acb: ac + bc,
      index: i - 1,
      d: distanceBetweenPointAndLineSegment(a, b, c),
    });
  }

  let sorted_arr = [...arr];
  // sorted_arr.sort((a, b) => a.acb - b.acb);
  sorted_arr.sort((a, b) => a.d - b.d);

  if (!sorted_arr.length) return null;
  // if (sorted_arr[0] === arr[0]) { console.log('ERRROR HERE'); return; }

  let current = sorted_arr[0];
  // let current_index = arr.indexOf(current);

  let req_data = [];
  for (let i = current.index; i < arr.length; i++) {
    if (arr[i].stop_a_id == destinationStopId) break;
    req_data.push([arr[i].stop_a_id, arr[i].stop_b_id]);
  }

  let timeIntervals = await getTimeIntervalOfPairStops(req_data);

  const generateKey = (a, b) => a.toString() + "-" + b.toString();

  // console.log(req_data);
  // console.log(timeIntervals[generateKey(current.stop_a_id, current.stop_b_id)], generateKey(current.stop_a_id, current.stop_b_id)); return;

  let sum =
    (timeIntervals[generateKey(current.stop_a_id, current.stop_b_id)] *
      current.bc) /
    current.acb;
  // let sum = 0;

  // console.log(sum);

  for (let i = current.index + 1; i < arr.length; i++) {
    if (arr[i].stop_a_id == destinationStopId) break;
    sum +=
      (timeIntervals[generateKey(arr[i].stop_a_id, arr[i].stop_b_id)] *
        arr[i].bc) /
      arr[i].acb;
  }

  return sum;
}

function findDirectionOfBus(route, message) {
  const getMinDistanceIndex = (coords, location) => {
    const precision = 100000;
    const streetWidth = 0.0003948959753348208;
    let maxDistance = streetWidth; // * precision;
    let min = Infinity;
    let minIndex = null;

    for (let i = 1; i < coords.length; i++) {
      let a = {
        x: Number(coords[i - 1][0]),
        // * precision,
        y: Number(coords[i - 1][1]),
        // * precision,
      };

      let b = {
        x: Number(coords[i][0]),
        // * precision,
        y: Number(coords[i][1]),
        // * precision,
      };

      let p = {
        x: Number(location[1]),
        // * precision,
        y: Number(location[0]),
        // * precision,
      };

      let c = {
        x: a.x + (b.y - a.y),
        y: a.y - (b.x - a.x),
      };

      let d = {
        x: b.x + (b.y - a.y),
        y: b.y - (b.x - a.x),
      };

      const p1 = wherePointAccordingToVector(a, c, p);
      const p2 = wherePointAccordingToVector(b, d, p);
      if (p1 === p2) continue;

      const distance = distanceBetweenPointAndVector(a, b, p);
      // const [distance] = pnt2line([a.x, a.y, 0], [b.x, b.y, 0], [p.x, p.y, 0]);
      // console.log(distance);
      if (distance < maxDistance && distance < min) {
        // console.log(maxDistance, distance);
        min = distance;
        minIndex = i;
      }
    }

    return { min, index: minIndex };
  };

  const getAngleBetweenRouteAndMessage = (coords, message) => {
    const mi = getMinDistanceIndex(coords, message.location);

    if (mi.index === null) return [null];

    let a = coords[mi.index - 1];
    let b = coords[mi.index];

    // a = [Number(a[1]), Number(a[0])];
    // b = [Number(b[1]), Number(b[0])];

    // routeAngle = angleBetweenVectorAndPlusXAxis(a, b);

    // diffAngle = Math.abs(routeAngle - message.angle);

    // return Math.min(diffAngle, 360 - diffAngle);

    a = { x: Number(a[1]), y: Number(a[0]) };
    b = { x: Number(b[1]), y: Number(b[0]) };

    return [angleBetweenTwoVectors(a, b, message.angle), mi.index, mi.min];
  };

  const [start, start_index, start_min] = getAngleBetweenRouteAndMessage(
    route.start_coords,
    message
  );
  const [end, end_index, end_min] = getAngleBetweenRouteAndMessage(
    route.end_coords,
    message
  );

  if ([start, end].includes(null)) return null;

  return [start_min < end_min, start, end, start_index, end_index];
}

/**
 *
 * @param {Point} a
 * @param {Point} b
 * @param {Point} p
 */
function distanceBetweenPointAndVector(a, b, p) {
  const xx = b.x - a.x;
  const yy = b.y - a.y;

  const up = Math.abs(xx * (a.y - p.y) - yy * (a.x - p.x));
  const down = Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));

  return up / down;
}

function distanceBetweenTwoPoints(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function distanceBetweenPointAndLineSegment(a, b, p) {
  let c = {
    x: a.x + (b.y - a.y),
    y: a.y - (b.x - a.x),
  };

  let d = {
    x: b.x + (b.y - a.y),
    y: b.y - (b.x - a.x),
  };

  const p1 = wherePointAccordingToVector(a, c, p);
  const p2 = wherePointAccordingToVector(b, d, p);
  
  if (p1 !== p2) return distanceBetweenPointAndVector(a, b, p);

  return Math.min(
    distanceBetweenTwoPoints(a, p),
    distanceBetweenTwoPoints(b, p)
  );
}

function angleBetweenVectorAndPlusXAxis(a, b) {
  b = [b[0] - a[0], b[1] - a[1]];
  a = [0, 0];
  precision = 10000;
  b = [b[0] * precision, b[1] * precision];

  const angle =
    ((Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0])) * 180) / Math.PI;
  return angle < 0 ? 360 + angle : angle;
}

function angleBetweenVectorAndXAxis(a, b) {
  let dx = b.x - a.x;
  // Minus to correct for coord re-mapping
  let dy = b.y - a.y;

  let inRads = Math.atan2(dy, dx);

  // We need to map to coord system when 0 degree is at 3 O'clock, 270 at 12 O'clock
  if (inRads < 0) inRads = Math.abs(inRads);
  else inRads = 2 * Math.PI - inRads;

  return 360 - inRads * (180 / Math.PI);
}

function angleBetweenTwoVectors(a, b, alpha) {
  let gamma = angleBetweenVectorAndXAxis(a, b);

  const arr = [
    Math.abs(alpha - gamma),
    Math.abs(360 - alpha + gamma),
    Math.abs(360 - gamma + alpha),
  ];

  return Math.min(...arr);
}

function wherePointAccordingToVector(a,b,p) {
  const s = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  if (s > 0) return 1;
  else if (s < 0) return -1;
  else return 0;
}

exports.arrivalTime = async (destinationStopId) => {
  const routeNumbers = await getRouteNumbersByStopId(destinationStopId);

  const buses = await getBusNumbersByRouteNumbers(routeNumbers);

  const busNumbers = buses.map((e) => e.car_number);

  const messagesObj = await getLastMessagesOfBuses(busNumbers);

  // console.log(JSON.stringify(messagesObj, null, 2));

  // const units = await getUnitIdsByBusNumbers(busNumbers);

  // const unitIds = Object.keys(units).map(e => units[e].unitId);

  // const messagesObj = await getLastMessagesOfUnits(unitIds);

  const resultBusArr = [];
  const routesObj = {};

  // console.log(Object.keys(messagesObj));

  for (let bus of buses) {
    let good = true;

    const car_number = bus.car_number;

    if (good && messagesObj[car_number]) {
      bus.location = messagesObj[car_number].location;
      bus.time = messagesObj[car_number].time;
      bus.angle = messagesObj[car_number].angle;
    } else good = false;

    if (!routesObj[bus.number]) {
      routesObj[bus.number] = await Route.findOne({
        where: { number: bus.number },
      });
    }

    const route = routesObj[bus.number];

    // console.log(route.id);

    if (good && route) {
      bus.route = route;
      const fn_res = findDirectionOfBus(route, bus);
      if (fn_res !== null) {
        [
          bus.direction,
          bus.route_start_deg,
          bus.route_end_deg,
          bus.route_start_index,
          bus.route_end_index,
        ] = fn_res;
        resultBusArr.push(bus);
      }
    }
  }

  let result = {};

  for (let bus of resultBusArr) {
    if (!result[bus.number]) result[bus.number] = [];

    const stopIds = bus.direction ? bus.route.start_stops : bus.route.end_stops;

    let timeArrival = await findTimeArrival(
      stopIds,
      destinationStopId,
      bus.location
    );

    timeArrival -= new Date().getTime() / 1000 - bus.time;

    if (Number.isNaN(timeArrival) || timeArrival === null) continue;
    // result[bus.number].push({timeArrival, bus_number: bus.car_number});
    result[bus.number].push({
      n: bus.number,
      t: timeArrival,
      cn: bus.car_number,
      l: bus.location,
      deg: bus.angle,
      route_start_deg: bus.route_start_deg,
      route_end_deg: bus.route_end_deg,
      route_start_index: bus.route_start_index,
      route_end_index: bus.route_end_index,
      direction: bus.direction,
    });
  }

  // for (let key in result) {
  //   result[key].sort((a, b) => a - b);
  // }

  console.log(result);
  return result;
};
