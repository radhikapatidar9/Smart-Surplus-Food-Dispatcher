const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});

/**
 * Google Maps API Wrapper.
 */

/**
 * Get directions and distance between two points.
 * @param {Array<number>} origin - [lng, lat]
 * @param {Array<number>} destination - [lng, lat]
 * @returns {Promise<Object>} Distance, Duration, and Polyline
 */
const getRouteDetails = async (origin, destination) => {
  try {
    const response = await client.directions({
      params: {
        origin: `${origin[1]},${origin[0]}`,       // Google uses lat,lng
        destination: `${destination[1]},${destination[0]}`,
        mode: 'driving',
        key: process.env.GOOGLE_MAPS_API_KEY,
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API Error: ${response.data.status}`);
    }

    const route = response.data.routes[0].legs[0];
    
    return {
      distanceText: route.distance.text,
      distanceValue: route.distance.value,      // meters
      durationText: route.duration.text,
      durationValue: route.duration.value,      // seconds
      polyline: response.data.routes[0].overview_polyline.points,
      bounds: response.data.routes[0].bounds
    };
  } catch (err) {
    console.error('Google Directions Error:', err.message);
    // Fallback to straight-line distance if API fails/missing
    return null;
  }
};

/**
 * Get distance matrix for multiple origins and one destination.
 * Useful for finding the truly nearest volunteer by travel time.
 * @param {Array<Array<number>>} origins - [[lng, lat], ...]
 * @param {Array<number>} destination - [lng, lat]
 * @returns {Promise<Array>} List of distances and durations
 */
const getDistances = async (origins, destination) => {
  try {
    const response = await client.distancematrix({
      params: {
        origins: origins.map(o => `${o[1]},${o[0]}`),
        destinations: [`${destination[1]},${destination[0]}`],
        mode: 'driving',
        key: process.env.GOOGLE_MAPS_API_KEY,
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps Matrix Error: ${response.data.status}`);
    }

    return response.data.rows.map(row => ({
      distance: row.elements[0].distance,
      duration: row.elements[0].duration,
      status: row.elements[0].status
    }));
  } catch (err) {
    console.error('Google Matrix Error:', err.message);
    return null;
  }
};

module.exports = {
  getRouteDetails,
  getDistances
};
