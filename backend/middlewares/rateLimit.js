const rateLimit = (maxRequests, duration) => {
    const requests = {};

    return (req, res, next) => {
        const userId = req.user && req.user.id;

        if (!userId) {
            console.log('User ID not found in request');
            return res.status(400).send('User ID not found in request');
        }

        const now = Date.now();

        if (!requests[userId]) {
            requests[userId] = {
                count: 1,
                lastReset: now
            };
            console.log(`Request from user ID ${userId} accepted. Total requests: 1`);
            return next();
        }

        if (now - requests[userId].lastReset > duration) {
            requests[userId].count = 1;
            requests[userId].lastReset = now;
            console.log(`Request from user ID ${userId} accepted after reset. Total requests: 1`);
            return next();
        }

        if (requests[userId].count < maxRequests) {
            requests[userId].count++;
            console.log(`Request from user ID ${userId} accepted. Total requests: ${requests[userId].count}`);
            return next();
        }

        console.log(`Request from user ID ${userId} rejected. Total requests: ${requests[userId].count}`);
        res.status(429).send('Too Many Requests');
    };
};

module.exports = rateLimit;