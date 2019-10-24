const HTTPStatusCodes = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    GATEWAY_TIMEOUT: 503
};

const Ports = {
    minPortRange: 1024,
    maxPortRange: 65535
};

const Routes = {
    Billboard: {
        generateBillboardRoute: "/internal/v2/billboard/generate",
        updateBillboardRoute: "/internal/v2/billboard/update"
    },
    GigEconomy: {
        updateGigEconomyRoute: "/internal/v2/gig_economy/update"
    }
};

module.exports = {
    HTTPStatusCodes,
    Ports,
    Routes
};