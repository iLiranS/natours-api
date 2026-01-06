const cache = require('../utils/cache');

exports.cachedGetAll = (baseKey, factoryFn) => {
    return async (req, res, next) => {
        const queryString = JSON.stringify(req.query);
        const key = Object.keys(req.query).length > 0
            ? `${baseKey}:${queryString}`
            : baseKey;
        const cached = cache.get(key);
        if (cached) {
            return res.status(200).json({
                status: 'success',
                source: 'cache',
                data: cached
            });
        }
        // I want to cache the response only barefoot
        const originalJson = res.json.bind(res);
        if (Object.keys(req.query).length === 0) {
            res.json = (body) => {
                cache.set(key, body.data);
                return originalJson(body);
            };
        }

        factoryFn(req, res, next);
    };
};

exports.invalidateCache = (keys, factoryFn) => {
    return async (req, res, next) => {
        await factoryFn(req, res, next);
        keys.forEach(key => cache.del(key));
    };
};