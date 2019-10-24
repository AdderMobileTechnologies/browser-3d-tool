/**
 * Takes an array of MAFTIGER geofences and filters out duplicate GEOIDs, returning an array where each entry is unique.
 * @param geofences The array of geofences to scrub.
 * @returns {[]} The array of unique geofences.
 */
module.exports = function(geofences) {
    let set = new Set();
    let validGeofences = [];
    for(let geofence of geofences) {
        let id = geofence._id;
        let { GEOID: geoID } = geofence.properties;
        if(geoID === undefined || geoID === null) {
            throw new Error(`Geofence ${id} does not contain a GEOID field in its properties!`);
        }
        if(set.has(geoID)) {
            continue;
        }
        set.add(geoID);
        validGeofences.push(geofence);
    }

    return validGeofences;
};