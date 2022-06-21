const express = require('express');
const app = express();

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// start loading atlogistika data
require('./atlogistika')();

// routes
require('./app')(app);

// error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ mess: err.message });
});

// start server
const PORT = 3050;
app.listen(PORT, () => console.log('listening on port: ' + PORT));