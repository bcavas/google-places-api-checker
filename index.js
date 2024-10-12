require('dotenv').config();
const express = require('express');
const placesRoutes = require('./routes/places');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use('/api', placesRoutes);

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});