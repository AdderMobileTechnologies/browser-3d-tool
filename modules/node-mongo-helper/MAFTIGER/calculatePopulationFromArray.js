/**
 * Takes an array of MAFTIGER geofences and returns the total population contained within those geofences.
 * @param geofences An array of geofences to check.
 * @returns {number} The total population contained within those geofences.
 */
module.exports = function(geofences) {
    let totalPopulation = 0;
    for(let geofence of geofences) {
        let id = geofence._id;

        let { population } = geofence.properties;
        if(population === undefined || population === null) {
            console.warn(`MAFTIGER Geofence Document ${id} does not contain a population field!`);
            continue;
        }

        totalPopulation += Number(population.population);
    }
    return totalPopulation;
};