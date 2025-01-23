const createQueue = require('../libs/bull');

const reminderQueue = createQueue('notifications-sender');

module.exports = {
    reminderQueue
}