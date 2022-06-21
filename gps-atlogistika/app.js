const asyncHandler = require('express-async-handler')
const fs = require('fs');
const filepath = './atlogistika.json';

const loadData = () => {
    if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath).toString());
        // return require(filepath);
    }

    return {
        updated_at: 0,
        list: [],
    };
}

// function angleBetweenVectorAndPlusXAxis(a, b) {
//     b = [b[0] - a[0], b[1] - a[1]];
//     a = [0, 0];
//     precision = 10000;
//     b = [b[0] * precision, b[1] * precision];

//     const angle = (Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0])) * 180 / Math.PI;
//     return angle < 0 ? 360 + angle : angle;
// }

module.exports = (router) => {
    router.get('/units', asyncHandler((req, res) => {
        const data = loadData();
        res.json(data);
    }));

    router.post('/units', asyncHandler((req, res, next) => {
        const { car_numbers } = req.body;
        const res_unit_id_by_name = {
            // '12-34 AGG': <unit>
        };

        const list = loadData().list.map(e => ({
            time: parseInt(e.status.unixtimestamp),
            location: [e.status.lon, e.status.lat],
            angle: e.status.dir,
            vehiclenumber: e.vehiclenumber,
        }));

        for (let car_number of car_numbers) {
            const found = list.find(e => normalizeCarNumber(e.vehiclenumber) === normalizeCarNumber(car_number));
            if (found) {
                res_unit_id_by_name[car_number] = found;
            }
        }

        return res.json({
            units: res_unit_id_by_name,
        });
    }));

    router.get('/memory-usage', asyncHandler((req, res) => {
        return res.json({
            process: process.memoryUsage(),
        });
    }));
}

function normalizeCarNumber(car_number) {
    let s = "";
    
    for (let i = 0; i < car_number.length; i++) {
        const c = car_number[i].toLowerCase();

        if (c >= '0' && c <= '9') s += c;
        if (c >= 'a' && c <= 'z') s += c;
    }

    return s;
    // return car_number.split('').filter(e => e !== ' ').join('').toLowerCase();
}