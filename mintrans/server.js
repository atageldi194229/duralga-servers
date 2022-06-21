const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use(require('./routes'));

// error handler
app.use(require('./middleware/error'));

const PORT = 3052;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));