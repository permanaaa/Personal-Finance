const { reminderQueue } = require('../utils/queue');
const logger = require('../libs/winston');
const Reminder = require('../models/reminderModel');
const Notification = require('../models/notificationModel');
const { getIo } = require('../libs/socketIo');
const crypto = require('crypto');
const { timeServer } = require('../utils/timeServer');
const { deleteKeysByPattern } = require('../libs/redis');

async function notificationWorker() {
    await reminderQueue.process(async (job) => {
        const { reminderId } = job.data;
        try {

            const reminder = await Reminder.findById(reminderId).populate('userId');
            if (!reminder) {
                throw new Error('Reminder not found');
            }

            const notification = new Notification({
                userId: reminder.userId._id,
                reminderId: reminder._id,
                status: 'unread',
                createdAt: timeServer()
            });
            await notification.save();

            const userId = reminder.userId._id.toString();
            const cacheKey = `notifications:${userId}`;
            const roomId = crypto.createHash('sha256').update(userId).digest('hex');
            const io = getIo();
            io.to(roomId).emit('newNotification', notification);

            await job.moveToCompleted('Job Completed', true);
            await deleteKeysByPattern(cacheKey);
            logger.info('Notification Send Successfully');
        } catch (e) {
            logger.error(e.toString());
            await job.moveToFailed(new Error('Job failed'), true);
            logger.error('Notification Failed to send');
        }
    });
}

module.exports = {
    notificationWorker
};
