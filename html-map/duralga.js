class ApiService {
  static API_DURALGA_DATA = "http://127.0.0.1:3051/api/duralga/data";

  static API_BUS_ARRIVAL_BY_STOP_ID = "http://127.0.0.1:3051/api/arrival/stop/";

  // static URL_LEAFLET_MAP =
  //   "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

  // static URL_LEAFLET_MAP = "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png";
  static URL_LEAFLET_MAP = "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png";

  static async getDuralgaData() {
    const res = await fetch(ApiService.API_DURALGA_DATA);
    return res.json();
  }

  static async getArrivalTimesByStopId(stopId) {
    const res = await fetch(ApiService.API_BUS_ARRIVAL_BY_STOP_ID + stopId);
    return res.json();
  }
}

class Stop {
  constructor(stop) {
    this.id = parseInt(stop["id"]);
    this.stopId = parseInt(stop["stopId"]);
    this.name = stop["name"];
    this.location = stop["location"];
    this.endpoint = stop["endpoint"];
  }
}

class Route {
  constructor(route) {
    this.id = parseInt(route["id"]);
    this.routeId = parseInt(route["routeId"]);
    this.number = parseInt(route["number"]);
    this.description = route["description"];
    this.start_coords = route["start_coords"];
    this.end_coords = route["end_coords"];
    this.start_stops = route["start_stops"];
    this.end_stops = route["end_stops"];
  }
}

class Duralga {
  stops = [];
  routes = [];

  constructor() {
    console.log("Duralga constructor");
  }

  async fechData() {
    const data = await ApiService.getDuralgaData();

    this.stops = data.stops.map((e) => new Stop(e));
    this.routes = data.routes.map((e) => new Route(e));
  }

  getStopRoutes(stopId) {
    return this.routes.filter((route) => {
      if (!route.start_stops.includes(stopId)) return false;
      if (!route.end_stops.includes(stopId)) return false;
      return true;
    });
  }
}

class SideBar {
  selectedStop = null;
  duralga = null;
  sidebarElement = null;

  constructor(duralga) {
    this.duralga = duralga;
    console.log("SideBar constructor");

    this.sidebarElement = document.querySelector(".right_side_bar");
    this.initDelegateEvents();
  }

  onSidebarClick(event) {
    const runIfIn = (f, ...elements) => {
      elements.forEach((el) => {
        if (typeof el === "string") el = document.querySelector(el);
        if (el.contains(event.target)) f(el);
      });
    };

    const findAncestor = (el, sel) => {
      while (
        !(el.matches || el.matchesSelector).call(el, sel) &&
        (el = el.parentElement)
      );
      return el;
    };

    console.log(event.target);

    runIfIn(() => {
      let el = findAncestor(event.target, ".bus_info");
      let routeNumber = el.querySelector("p.route_number").innerHTML;

      //TODO: shu yerde galdyn on slect route
    }, ...document.querySelectorAll(".bus_info"));
  }

  initDelegateEvents() {
    this.sidebarElement.addEventListener(
      "click",
      this.onSidebarClick.bind(this)
    );
  }

  createBusInfoNode(data) {
    let res = `
      <div class="bus_info">
      <p class="buses_list route_number">:routeNumber</p>

      <div class="bus_destination">
        <marquee>
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
    </div>`;

    res = res.replace(":routeNumber", data.routeNumber);
    res = res.replace(":routeDescriptionA", data.routeDescriptionA);
    res = res.replace(":routeDescriptionB", data.routeDescriptionB);
    res = res.replace(":arrivalTime1", data.arrivalTime1);
    res = res.replace(":arrivalTime2", data.arrivalTime2);
    res = res.replace(":arrivalTime3", data.arrivalTime3);
    res = res.replace("prototype", "");

    return res;
  }

  renderStopArrivalTimes(data) {
    const routeNumbers = Object.keys(data.arrivalTime);
    const routes = {};

    for (let r of this.duralga.routes) {
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

      return this.createBusInfoNode({
        routeNumber: routeNumber,
        routeDescriptionA: routes[routeNumber].description[0],
        routeDescriptionB: routes[routeNumber].description[0],
        arrivalTime1: arr[0],
        arrivalTime2: arr[1],
        arrivalTime3: arr[2],
      });
    });

    list_box.innerHTML = list.join("");
  }

  async fetchSelectedStopData() {
    if (!this.selectedStop) return;

    const data = await ApiService.getArrivalTimesByStopId(
      this.selectedStop.stopId
    );

    this.renderStopArrivalTimes(data);
  }

  showStop(stop, duralga) {
    this.selectedStop = stop;
    this.fetchSelectedStopData();
    // console.log(stop);
    // console.log(duralga.getStopRoutes(stop.stopId));
  }
}

class Map {
  duralga = new Duralga();
  sideBar = null;
  map = null;
  lastUserLocation = null;
  busMarkers = [];

  constructor() {
    this.sideBar = new SideBar(this.duralga);
    this.map = L.map("map").setView([37.915996, 58.36816], 17);
    L.tileLayer(ApiService.URL_LEAFLET_MAP).addTo(this.map);

    this.duralga.fechData().then(() => this.showDuralgaUI());

    // this.setMapViewToUserLocation();
  }

  setMapViewToUserLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      this.lastUserLocation = pos;

      let lat_lng = [pos.coords.latitude, pos.coords.longitude];

      this.map.setView(lat_lng, 17);

      //   map.panTo(new L.LatLng(latit, longit));
    });
  }

  onStopMarkerClick(stop, event) {
    this.sideBar.showStop(stop, this.duralga);
  }

  createStopMarker(stop) {
    return L.marker(stop.location, {
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
    }).on("click", this.onStopMarkerClick.bind(this, stop));
  }

  setStopMarkersOnMap() {
    const markers = L.markerClusterGroup();

    for (let stop of this.duralga.stops) {
      markers.addLayer(this.createStopMarker(stop));
    }

    this.map.addLayer(markers);
  }

  showRouteOnMap(route) {
    // logger.debug("selected route number:", route.number);

    if (!map_route) {
      map_route = {};

      map_route.start = L.polyline(route.start_coords, { color: "red" }).addTo(
        map
      );
      map_route.end = L.polyline(route.end_coords, { color: "green" }).addTo(
        map
      );
    } else {
      map_route.start.setLatLngs(route.start_coords);
      map_route.end.setLatLngs(route.end_coords);
    }

    var markerA = L.marker(route.start_coords[0], {
      icon: createCharIcon("A", {
        iconAnchor: [30, 0],
        color: "red",
      }),
    }).addTo(this.map);
    var markerB = L.marker(route.start_coords[route.start_coords.length - 1], {
      icon: createCharIcon("B", {
        iconAnchor: [30, 0],
        color: "red",
      }),
    }).addTo(this.map);

    var markerC = L.marker(route.end_coords[0], {
      icon: createCharIcon("C", {
        iconAnchor: [-30, 0],
        color: "green",
      }),
    }).addTo(this.map);
    var markerD = L.marker(route.end_coords[route.end_coords.length - 1], {
      icon: createCharIcon("D", {
        iconAnchor: [-30, 0],
        color: "green",
      }),
    }).addTo(this.map);

    // zoom the map to the polyline
    this.map.fitBounds(map_route.start.getBounds());
  }

  showDuralgaUI() {
    this.setStopMarkersOnMap();
  }
}

const mapInstance = new Map();
