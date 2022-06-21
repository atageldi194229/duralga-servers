const express = require("express");
// const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const path = require("path");

// cors
app.use(cors());

// body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// start bus info collector service
// require('./services/bus-info.service')();

// static
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use(require("./routes"));

// start server on port
const PORT = 8788;
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
