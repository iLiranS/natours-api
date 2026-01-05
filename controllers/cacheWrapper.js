const cache = require('../utils/cache');

exports.cachedGetAll = (key, factoryFn) => {
    return async (req, res, next) => {
        const cached = cache.get(key);
        if (cached) {
            return res.status(200).json({
                status: 'success',
                source: 'cache',
                data: cached
            });
        }

        const originalJson = res.json.bind(res);

        res.json = (body) => {
            cache.set(key, body.data);
            return originalJson(body);
        };

        factoryFn(req, res, next);
    };
};

exports.invalidateCache = (keys, factoryFn) => {
    return async (req, res, next) => {
        await factoryFn(req, res, next);
        keys.forEach(key => cache.del(key));
    };
};