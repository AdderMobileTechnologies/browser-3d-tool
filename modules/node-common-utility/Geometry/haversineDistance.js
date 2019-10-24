module.exports = function haversineDistance(basePoint, endPoint) {
    const baseLat = (basePoint.lat / 180) * Math.PI;
    const baseLng = (basePoint.lng / 180) * Math.PI;
    const endLat = (endPoint.lat / 180) * Math.PI;
    const endLng = (endPoint.lng / 180) * Math.PI;

    const earthRadiusFeet = 3963.1906 * 5280;
    const dLat = endLat - baseLat;
    const dLng = endLng - baseLng;
    const a = Math.sin(dLat / 2) * Math.sin(dLat /2) + Math.sin(dLng / 2) * Math.sin(dLng /2) * Math.cos(baseLat) * Math.cos(endLat);
    const c = 2 * Math.asin(Math.sqrt(a));
    return earthRadiusFeet * c;
};