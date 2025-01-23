const Notification = require('../models/notificationModel');
const Reminder = require('../models/reminderModel');
const Allocation = require('../models/allocationModel');
const logger = require('../libs/winston');
const { client, deleteKeysByPattern} = require("../libs/redis");
const { timeServer } = require("../utils/timeServer");

const notificationController = {
    getAllNotification: async (req, res) => {
        const { page, perPage } = req.query;
        const userId = req.user.id;
        const cacheKey = `notifications:${userId}:${page}:${perPage}`;

        try {
            let cacheData = await client.get(cacheKey);
            if (cacheData) {
                cacheData = JSON.parse(cacheData);
                return res.status(200).send({
                    status: true,
                    data: cacheData.data,
                    totalPage: cacheData.totalPage,
                    totalTransactions: cacheData.totalTransactions
                });
            } else {
                const query = { userId };
                const totalTransactions = await Notification.find(query).countDocuments();
                const totalPage = Math.ceil(totalTransactions / perPage);

                const notifications = await Notification.find(query)
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .sort({ createdAt: -1 })
                    .populate({
                        path: 'reminderId',
                        select: 'title allocationId',
                        model: Reminder
                    });

                const notificationsWithDetails = await Promise.all(notifications.map(async notification => {
                    const allocationId = notification.reminderId ? notification.reminderId.allocationId : null;

                    let allocationName = null;
                    if (allocationId) {
                        const allocation = await Allocation.findById(allocationId).select('name');
                        allocationName = allocation ? allocation.name : null;
                    }

                    return {
                        ...notification.toObject(),
                        reminderTitle: notification.reminderId ? notification.reminderId.title : null,
                        allocationName: allocationName
                    };
                }));

                await client.set(cacheKey, JSON.stringify({ data: notificationsWithDetails, totalPage, totalTransactions }), { EX: 60 * 2 });

                return res.status(200).send({
                    status: true,
                    data: notificationsWithDetails,
                    totalPage,
                    totalTransactions
                });
            }

        } catch (e) {
            logger.error(e.toString());
            res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    putNotification: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `notifications:${userId}`;

        try {
            if(await Notification.findByIdAndUpdate(id, { status: 'read', updatedAt: timeServer() })) {
                await deleteKeysByPattern(cacheKey);
                return res.status(200).send({status: true, message: 'Notification read successfully.'});
            } else {
                return res.status(404).send({status: false, message: 'Notification not found.'});
            }

        } catch (e) {
            logger.error(e.toString());
            res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    deleteNotification: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `notifications:${userId}`;

        try {
            if(await Notification.findByIdAndDelete(id)) {
                await deleteKeysByPattern(cacheKey);
                return res.status(200).send({status: true, message: 'Notification deleted successfully.'});
            } else {
                return res.status(404).send({status: false, message: 'Notification not found.'});
            }

        } catch (e) {
            logger.error(e.toString());
            res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    },

    postUpdateOrDeleteAllNotification: async (req, res) => {
        const { action } = req.body;
        const userId = req.user.id;
        const cacheKey = `notifications:${userId}`;

        try {
            if (action === 'read') {
                await Notification.updateMany(
                    { userId: userId },
                    { $set: { status: 'read' } }
                );
                await deleteKeysByPattern(cacheKey);

                return res.status(200).send({ status: true, message: 'All notifications marked as read.' });
            } else if (action === 'delete') {
                await Notification.deleteMany({ userId: userId });
                await deleteKeysByPattern(cacheKey);

                return res.status(200).send({ status: true, message: 'All notifications deleted.' });
            }

        } catch (e) {
            logger.error(e.toString());
            res.status(500).send({ status: false, message: 'Internal server error.' });
        }

    }

}

module.exports = notificationController;