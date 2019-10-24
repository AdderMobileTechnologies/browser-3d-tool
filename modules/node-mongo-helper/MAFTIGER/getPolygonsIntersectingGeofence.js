// Database containing target collection
const DATABASE_NAME = "GeofencesDB";

// Collection to search
const COLLECTION_NAME = "MAFTIGER";

/**
 * Checks for any geofences that intersect with the provided geofence geometry.
 * This function assumes that a MongoClient object has already been created and passed to the function,
 * and that the geofences are contained in the GeofencesDB/MAFTIGER collection.
 * @param polygon The polygon to check.
 * @param mongoClient A connected mongoClient.
 * @returns {Promise<void>} A promise that, when resolved, returns an array consisting of all geofences that intersect
 * the provided polygon, or an empty array if none were found. Rejects with a standard Error if a problem occurs.
 */
module.exports = async function(polygon, mongoClient) {
    const query = {
        geometry: {
            $geoIntersects: {
                $geometry: polygon,
            }
        }
    };

    try {
        return await mongoClient.db(DATABASE_NAME).collection(COLLECTION_NAME).find(query).toArray();
    } catch(err) {
        throw new Error(`An error occurred while attempting to retrieving geofences from database:\n${err.stack}`);
    }
};