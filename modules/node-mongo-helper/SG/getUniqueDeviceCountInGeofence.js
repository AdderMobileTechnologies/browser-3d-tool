// Database containing target collection
const DATABASE_NAME = "ImpressionsDB";

/**
 * Checks for any impressions that are contained within a polygon.
 * This function assumes that a MongoClient object has already been created and passed to the function,
 * and that the impressions are contained in the ImpressionsDB.
 * @param polygon The polygon that contains the impressions.
 * @param collection The collection to query.
 * @param mongoClient A connected mongoClient.
 * @returns {Promise<number>} A promise that, when resolved, returns the count of impressions contained in the specified
 * collection within the specified polygon, or 0 if none are found. Rejects with a standard Error if a problem occurs.
 */

async function __singleGeofence(polygon, collection, mongoClient) {
    const query = {
        location: {
            $geoIntersects: {
                $geometry: polygon
            }
        }
    };

    const projection = {
        "properties.AD_ID": 1
    };

    let impressions = [];
    try {
        impressions = await mongoClient
            .db(DATABASE_NAME)
            .collection(String(collection))
            .find(query, projection)
            .toArray();
    } catch(err) {
        throw new Error(`An error occurred while attempting to retrieving geofences from database:\n${err.stack}`);
    }

    let uniqueSet = new Set();
    for(let impression of impressions) {
        uniqueSet.add(impression.properties.AD_ID);
    }

    return uniqueSet.size;
}

async function __multipleGeofence(polygons, collection, mongoClient) {
    let uniqueSet = new Set();

    for(let polygon of polygons) {
        const query = {
            location: {
                $geoIntersects: {
                    $geometry: polygon
                }
            }
        };


        const projection = {
            "properties.AD_ID": 1
        };

        try {
            let impressions = await mongoClient
                .db(DATABASE_NAME)
                .collection(String(collection))
                .find(query, projection)
                .toArray();
            for(let impression of impressions) {
                uniqueSet.add(impression.properties.AD_ID);
            }
        } catch(err) {
            throw new Error(`An error occurred while attempting to retrieving geofences from database:\n${err.stack}`);
        }
    }


    return uniqueSet.size;
}

module.exports = async function(polygon, collection, mongoClient) {
    if(Array.isArray(polygon)) {
        return await __multipleGeofence(polygon, collection, mongoClient);
    } else {
        return await __singleGeofence(polygon, collection, mongoClient);
    }
};