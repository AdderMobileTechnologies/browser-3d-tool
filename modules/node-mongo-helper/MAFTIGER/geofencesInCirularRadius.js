// Database containing target collection
const DATABASE_NAME = "GeofencesDB";

// Collection to search
const COLLECTION_NAME = "MAFTIGER";

// Conversion factor for feet to meters
const METERS_CONVERSION_FACTOR = 3.281;

/**
 * Finds and returns all geofences that are contained within a circular radius of a given point.
 * This function assumes that a MongoClient object has already been created and passed to the function,
 * and that the geofences are contained in the GeofencesDB/MAFTIGER collection.
 *
 * @param point An object describing the point and radius to search. Is of form:
 *      {
 *          lng: <NUMBER>,      // Longitude of point
 *          lat: <NUMBER>,      // Latitude of point
 *          radius: <NUMBER>    // Radius to search, in feet.
 *      }
 * @param mongoClient An already connected mongoClient to use for the connection.
 *
 * @returns {Promise<void>} A promise that, when resolved, provides an array of the geofences that were located, or
 * an empty array if none were located. The promise rejects with a standard error object if a problem occurred.
 */
module.exports = async function(point, mongoClient) {
    let lng = Number(point.lng);
    let lat = Number(point.lat);
    let radius = Number(point.radius);
    const query = {
        geometry: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                $maxDistance: radius / METERS_CONVERSION_FACTOR
            }
        }
    };

    try {
        return await mongoClient.db(DATABASE_NAME).collection(COLLECTION_NAME).find(query).toArray();
    } catch(err) {
        throw new Error(`An error occurred while attempting to retrieving geofences from database:\n${err.stack}`);
    }
};