const express = require('express');
const { getPlacesCount } = require('../services/googlePlacesService');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/places', async (req, res) => {
  const { businessType, zipCode } = req.query;

  logger.info(`Received request for places. Business Type: ${businessType}, Zip Code: ${zipCode}`);

  if (!businessType || !zipCode) {
    logger.warn('Missing required parameters');
    return res.status(400).json({ error: 'Business type and zip code are required' });
  }

  try {
    logger.info('Calling Google Places API');
    const numberOfPlaces = await getPlacesCount(businessType, zipCode);

    logger.info(`Successfully retrieved places count: ${numberOfPlaces}`);
    res.json({
      businessType,
      zipCode,
      numberOfPlaces,
    });
  } catch (error) {
    logger.error('Error querying Google Places API:', error);
    res.status(500).json({ error: 'An error occurred while querying the Google Places API' });
  }
});

module.exports = router;