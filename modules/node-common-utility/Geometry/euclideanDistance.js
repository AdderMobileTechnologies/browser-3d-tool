module.exports = function euclideanDistance(point0, point1) {
    return Math.sqrt(Math.pow((point1.x - point0.x), 2) + Math.pow((point1.y - point0.y), 2));
};