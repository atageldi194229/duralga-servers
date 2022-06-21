// let logger = new HtmlLogger({
//     name: "Duralga Map",
//     shortCuts: {
//         toggle: 'shift+ ',
//         clean: 'shift+C',
//     }
// });
// logger.init(false); // appends the logger

var map = L.map("map").setView([37.915996, 58.36816], 17);
var map_route = null; // = L.polyline(latlngs, {color: 'red'}).addTo(map);
storage = {
  stops: [],
  routes: [],
};

L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
).addTo(map);

fetch("http://127.0.0.1:3051/api/duralga/data")
  .then((res) => res.json())
  .then((data) => {
    storage.stops = data.stops;
    storage.routes = data.routes;

    let stops = data.stops;

    var markers = L.markerClusterGroup();

    for (let stop of stops) {
      let [x, y] = stop.location.map((e) => Number(e));

      let marker = L.marker([x, y], {
        title:
          "stopId: " +
          stop.stopId +
          "\n" +
          "name: " +
          stop.name +
          "\n" +
          "location: " +
          stop.location.join(", ") +
          "\n",
      }).on("click", function (e) {
        (storage.selectedStopId = stop.stopId), handleStop();
      });

      markers.addLayer(marker);
    }

    map.addLayer(markers);
  });

function createCharIcon(char, options = {}) {
  var el = document.createElement("span");
  el.style.color = options.color || "black";
  el.innerText = char;

  return L.divIcon({
    ...options,
    className: "char-div-icon",
    html: el,
  });
}

function showRouteByNumber(number) {
  const route = storage.routes.find((e) => e.number == number);
  if (route) showRoute(route);
}

function showRoute(route) {
  logger.debug("selected route number:", route.number);

  if (!map_route) {
    map_route = {};

    map_route.start = L.polyline(route.start_coords, { color: "red" }).addTo(
      map
    );
    map_route.end = L.polyline(route.end_coords, { color: "green" }).addTo(map);
  } else {
    map_route.start.setLatLngs(route.start_coords);
    map_route.end.setLatLngs(route.end_coords);
  }

  var markerA = L.marker(route.start_coords[0], {
    icon: createCharIcon("A", {
      iconAnchor: [30, 0],
      color: "red",
    }),
  }).addTo(map);
  var markerB = L.marker(route.start_coords[route.start_coords.length - 1], {
    icon: createCharIcon("B", {
      iconAnchor: [30, 0],
      color: "red",
    }),
  }).addTo(map);

  var markerC = L.marker(route.end_coords[0], {
    icon: createCharIcon("C", {
      iconAnchor: [-30, 0],
      color: "green",
    }),
  }).addTo(map);
  var markerD = L.marker(route.end_coords[route.end_coords.length - 1], {
    icon: createCharIcon("D", {
      iconAnchor: [-30, 0],
      color: "green",
    }),
  }).addTo(map);

  // zoom the map to the polyline
  map.fitBounds(map_route.start.getBounds());
}

function showBuses(buses) {
  if (storage.buses) {
    for (let bus of storage.buses) {
      bus.removeFrom(map);
    }
  }

  storage.buses = buses.map((bus, i) => {
    const className = "bus-" + i;

    let icon = L.icon({
      iconUrl: "/img/arrow1.png",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className,
    });

    let [y, x] = bus.l;

    let marker = L.marker([x, y], {
      icon,
      rotationAngle: bus.deg - 90,
      title: "car_number: "
        .concat(bus.cn)
        .concat("\nroute_number: ")
        .concat(bus.n)
        .concat("\nbus_direction: ")
        .concat(bus.direction)
        .concat("\nbus_angle: ")
        .concat(bus.deg)
        .concat("\nroute_start_deg: ")
        .concat(bus.route_start_deg)
        .concat("\nroute_end_deg: ")
        .concat(bus.route_end_deg),
    })
      .addTo(map)
      .on("click", () => {
        let latlngs = null;
        let _route = storage.routes.find((e) => e.number == bus.n);

        if (bus.direction) {
          latlngs = [
            _route.start_coords[bus.route_start_index - 1],
            _route.start_coords[bus.route_start_index],
          ];
        } else {
          latlngs = [
            _route.end_coords[bus.route_end_index - 1],
            _route.end_coords[bus.route_end_index],
          ];
        }

        console.log(
          Math.sqrt(
            Math.pow(
              Number(_route.start_coords[0][0]) -
                Number(_route.start_coords[1][0]),
              2
            ) +
              Math.pow(
                Number(_route.start_coords[0][1]) -
                  Number(_route.start_coords[1][1]),
                2
              )
          )
        );

        if (!storage.selected_stop_polyline) {
          storage.selected_stop_polyline = L.polyline(latlngs, {
            color: "blue",
          }).addTo(map);
        } else {
          storage.selected_stop_polyline.setLatLngs(latlngs);
        }

        // zoom the map to the polyline
        map.fitBounds(storage.selected_stop_polyline.getBounds(), {
          duration: 1,
        });
      });

    marker.bindPopup(bus.cn).openPopup();

    const marker_el = document.querySelector("." + className);
    marker_el.style.transform = "rotate(" + bus.deg + "deg)";

    return marker;
  });
}

const sleep = (ms) => new Promise((fn) => setTimeout(fn, ms));

function showRouteButtons(data) {
  const routeNumbers = Object.keys(data.arrivalTime);
  console.log("data: ", data);
  showBusesByRoutes(data);

  const buttons = routeNumbers.map((e) =>
    logger.button(e.toString(), () => {
      logger.debug(JSON.stringify(data.arrivalTime[e], null, 2));

      const found_route = storage.routes.find((r) => r.number == e);

      showBuses(data.arrivalTime[e]);

      if (found_route) showRoute(found_route);
    })
  );

  logger.debug(...buttons);

  return data;
}

function getCopyOfNode(node) {
  const div = document.createElement("div");
  div.append(node);
  const result = div.innerHTML;
  div.remove();
  return result;
}

function createBusInfoNode(data) {
  // let res = getCopyOfNode(document.querySelector(".bus_info"));

  let res = `
  <div class="bus_info">
  <p class="buses_list">:routeNumber</p>

  <div class="bus_destination">
    <marquee loop="-1">
      <span>:routeDescriptionA</span>
      <i class="bx bx-right-arrow-alt"></i>
      <span>:routeDescriptionB</span>
    </marquee>
  </div>

  <div class="bus_time">
    <span class="bus_arr_time">:arrivalTime1</span>

    <i class="bx bxs-right-arrow"></i>

    <span class="bus_arr_time">:arrivalTime2</span>

    <i class="bx bxs-right-arrow"></i>

    <span class="bus_arr_time">:arrivalTime3</span>
  </div>
</div>
  `;

  res = res.replace(":routeNumber", data.routeNumber);
  res = res.replace(":routeDescriptionA", data.routeDescriptionA);
  res = res.replace(":routeDescriptionB", data.routeDescriptionB);
  res = res.replace(":arrivalTime1", data.arrivalTime1);
  res = res.replace(":arrivalTime2", data.arrivalTime2);
  res = res.replace(":arrivalTime3", data.arrivalTime3);
  res = res.replace("prototype", "");

  return res;
}

function showBusesByRoutes(data) {
  const routeNumbers = Object.keys(data.arrivalTime);
  const routes = {};

  for (let r of storage.routes) {
    routes[r.number] = r;
  }

  const list_box = document.querySelector(".bus_list_box");
  list_box.innerHTML = "";

  const list = routeNumbers.map((routeNumber) => {
    let arr = data.arrivalTime[routeNumber];

    console.log(arr);

    arr = arr
      .map((e) => {
        let t = Number(e.t); // in seconds

        return Math.ceil(t / 60);
      })
      .filter((e) => e > 0);
    arr.sort((a, b) => a - b);

    while (arr.length < 3) {
      arr.push("--");
    }

    return createBusInfoNode({
      routeNumber: routeNumber,
      routeDescriptionA: routes[routeNumber].description[0],
      routeDescriptionB: routes[routeNumber].description[0],
      arrivalTime1: arr[0],
      arrivalTime2: arr[1],
      arrivalTime3: arr[2],
    });
  });

  list_box.innerHTML = list.join("");
  //   logger.button(e.toString(), () => {
  //     logger.debug(JSON.stringify(data.arrivalTime[e], null, 2));

  //     const found_route = storage.routes.find((r) => r.number == e);

  //     showBuses(data.arrivalTime[e]);

  //     if (found_route) showRoute(found_route);
  //   })
  // );
}

async function handleStop() {
  if (storage.isHandleStopRunning) {
    return;
  }

  // while (true) {
  const stopId = storage.selectedStopId;
  if (!stopId) return;

  await fetch("http://127.0.0.1:3051/api/arrival/stop/" + stopId)
    .then((res) => res.json())
    .then((data) => showRouteButtons(data))
    .catch(console.error);

  // await sleep(3000);
  // }
}
