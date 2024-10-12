const { Client } = require('@googlemaps/google-maps-services-js');
const logger = require('../utils/logger');

const googleMapsClient = new Client({});

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

async function retryWithExponentialBackoff(fn, retries = 0) {
  try {
    logger.info(`Attempting API call. Retry count: ${retries}`);
    return await fn();
  } catch (error) {
    if (retries >= MAX_RETRIES) {
      logger.error(`Max retries reached. Throwing error: ${error.message}`);
      throw error;
    }
    const delay = INITIAL_DELAY * Math.pow(2, retries);
    logger.info(`API call failed. Retrying after ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithExponentialBackoff(fn, retries + 1);
  }
}

async function getPlacesCount(businessType, zipCode) {
  logger.info(`Getting places count for ${businessType} in ${zipCode}`);
  return retryWithExponentialBackoff(async () => {
    const response = await googleMapsClient.textSearch({
      params: {
        query: `${businessType} in ${zipCode}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    logger.info(`Places API response received. Results count: ${response.data.results.length}`);
    return response.data.results.length;
  });
}

module.exports = {
  getPlacesCount,
};