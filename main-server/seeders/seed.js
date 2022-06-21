const { Route, Stop, RouteStop } = require('../models');
const data = require('../public/duralga.json');

(async () => {
    for (let e of data.stops) {
        await Stop.create({
            stopId: e.id,
            name: e.n,
            location: [e.y, e.x],
            endpoint: Boolean(e.endp),
        });
    }
    for (let e of data.routes) {
        await Route.create({
            routeId: e.id,
            number: e.n,
            description: e.d,
            start_coords: e.start_coords,
            end_coords: e.end_coords,
            start_stops: e.start_stops,
            end_stops: e.end_stops,
        });

    }

    let repeats = 0;

    for (let e of data.routes) {
        const route_stops = [
            ...e.start_stops.map(g => ({ routeId: e.id, stopId: g })),
            ...e.end_stops.map(g => ({ routeId: e.id, stopId: g })),
        ];

        for (let route_stop of route_stops) {
            await RouteStop.create(route_stop).catch(async err => {
                let found = await RouteStop.findOne({ where: route_stop });
                if (found) repeats++;
            });
        }
    }

    console.log("repeats: " + repeats);

    console.log("Done");
    process.exit(0);
})();


// repeats: 225 -> wtf