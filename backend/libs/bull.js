const dotenv = require('dotenv');
const Queue = require('bull');

dotenv.config();

function createQueue(queueName, limiterConfig = null) {
    const options = {
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        },
    };

    if (limiterConfig) {
        options.limiter = limiterConfig;
    }

    return new Queue(queueName, options);
}

module.exports = createQueue;
