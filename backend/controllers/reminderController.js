const Reminder = require('../models/reminderModel');
const logger = require('../libs/winston');
const { client, deleteKeysByPattern } = require('../libs/redis');
const { timeServer, convertTimeServer, convertToMilisecond } = require('../utils/timeServer');
const { reminderQueue } = require('../utils/queue');
const crypto = require('crypto');
const { getIo } = require('../libs/socketIo');

const ReminderController = {
    getAllReminder: async (req, res) => {
        const { page, perPage, search, allocationId} = req.query;
        const userId = req.user.id;
        const cacheKey = `reminder:${userId}:${allocationId}:${search}:${page}:${perPage}`;

        try {
            let cacheData = await client.get(cacheKey);
            if(cacheData){
                cacheData = JSON.parse(cacheData);
                return res.status(200).send({status:true, data: cacheData.reminders, totalPage: cacheData.totalPage, totalReminder: cacheData.totalReminder});
            } else {
                const query = {userId};
                const conditions = {
                    title: search ? { $regex: search, $options: 'i' } : undefined,
                    allocationId: allocationId === 'All' || !allocationId ? undefined : allocationId,
                }

                const currentMonth = new Date().getMonth() + 1;
                if (currentMonth) {
                    conditions.dueDate = {
                        $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1),
                        $lt: new Date(new Date().getFullYear(), currentMonth, 1),
                    };
                }

                Object.keys(conditions).forEach(key => {
                    if (conditions[key] !== undefined) {
                        query[key] = conditions[key];
                    }
                });

                const totalReminder = await Reminder.find(query).countDocuments();
                const totalPage = Math.ceil(totalReminder / perPage) || 0;

                let reminders = await Reminder.find(query)
                    .skip((page - 1) * perPage)
                    .limit(perPage)
                    .sort({ name: 1, title: 1, dueDate: 1 })
                    .populate('allocationId', 'name');

                reminders = reminders.map(reminder => {
                    return {
                        _id: reminder._id,
                        title: reminder.title,
                        amount: reminder.amount,
                        dueDate: reminder.dueDate,
                        allocationId: reminder.allocationId._id,
                        allocationName: reminder.allocationId ? reminder.allocationId.name : null,
                    };
                });

                await client.set(cacheKey, JSON.stringify({reminders: reminders, totalPage: totalPage, totalReminder: totalReminder}), { EX: 60 * 5 });

                return res.status(200).send({status:true, data: reminders, totalPage: totalPage, totalReminder: totalReminder});
            }

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({status: false, message: 'Internal server error.'})
        }

    },

    getDetailReminder: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        try {
            const reminder = await Reminder.findById(id);
            if(!reminder) {
                return res.status(404).send({status: false, message: 'Reminder not found.'})
            }

            return res.status(200).send({status: true, data: reminder});

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({status:false, message:'Internal server error.'});
        }
    },

    postReminder: async (req, res) => {
        const { allocationId, title, amount, dueDate } = req.body;
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `reminder:${userId}`;

        try {

            if (convertTimeServer(dueDate) <= timeServer()) {
                return res.status(400).send({ status: false, message: 'Due date must be in the future.' });
            }

            const existingReminder = await Reminder.findOne({
                userId,
                allocationId,
                title,
                amount,
                dueDate: convertTimeServer(dueDate)
            });

            if (existingReminder) {
                return res.status(200).send({ status: true, message: 'Reminder already exists.' });
            }

            const newReminder = new Reminder({
                userId,
                allocationId,
                title,
                amount,
                dueDate: convertTimeServer(dueDate),
                createdAt: timeServer()
            });

            await newReminder.save();
            await deleteKeysByPattern(cacheKey);
            // await reminderQueue.add(
            //     { reminderId: newReminder._id },
            //     {
            //         delay: convertToMilisecond(dueDate) - (Date.now() + (7 * 60 * 60 * 1000)),
            //         removeOnComplete: true,
            //         removeOnFail: true,
            //         attempts: 3,
            //         backoff: {
            //             type: 'fixed',
            //             delay: 5000,
            //         },
            //     }
            // );

            await reminderQueue.add(
                { reminderId: newReminder._id },
                {
                    delay: 10000,
                    removeOnComplete: true,
                    removeOnFail: true,
                    attempts: 3,
                    backoff: {
                        type: 'fixed',
                        delay: 5000,
                    },
                }
            );

            return res.status(201).send({ status: true, message: 'Reminder created successfully.'});
        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }

    },

    putReminder: async (req, res) => {
        const { allocationId, title, amount, dueDate } = req.body;
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `reminder:${userId}`;

        try {
            if (convertTimeServer(dueDate) <= timeServer()) {
                return res.status(400).send({ status: false, message: 'Due date must be in the future.' });
            }

            const existingReminder = await Reminder.findById(id);

            if (!existingReminder || existingReminder.userId.toString() !== userId) {
                return res.status(404).send({ status: false, message: 'Reminder not found.' });
            }

            const fieldsToUpdate = {
                allocationId: allocationId,
                title: title,
                amount: amount,
                dueDate: dueDate ? convertTimeServer(dueDate) : undefined
            };

            const updatedFields = {};
            for (const [key, value] of Object.entries(fieldsToUpdate)) {
                if (value !== undefined && existingReminder[key] !== value) {
                    updatedFields[key] = value;
                }
            }

            if (Object.keys(updatedFields).length === 0) {
                return res.status(200).send({ status: true, message: 'No changes to update.' });
            }

            if (updatedFields.dueDate) {
                const identicalReminder = await Reminder.findOne({
                    userId: userId,
                    allocationId: updatedFields.allocationId || existingReminder.allocationId,
                    title: updatedFields.title || existingReminder.title,
                    amount: updatedFields.amount || existingReminder.amount,
                    dueDate: updatedFields.dueDate
                });

                if (identicalReminder) {
                    return res.status(400).send({ status: false, message: 'An identical reminder already exists for the new due date.' });
                }
            }

            updatedFields.updatedAt = timeServer();
            const updatedReminder = await Reminder.findByIdAndUpdate(id, updatedFields, { new: true });
            await deleteKeysByPattern(cacheKey);
            const job = await reminderQueue.getJob(id);

            if(job) {
                await job.remove();
            }

            await reminderQueue.add(
                { reminderId: id },
                {
                    delay: convertToMilisecond(updatedFields.dueDate) - (Date.now() + (7 * 60 * 60 * 1000)),
                    removeOnComplete: true,
                    removeOnFail: true,
                    attempts: 3,
                    backoff: {
                        type: 'fixed',
                        delay: 5000,
                    },
                }
            );

            return res.status(200).send({ status: true, message: 'Reminder updated successfully.'});
        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }

    },

    deleteReminder: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const cacheKey = `reminder:${userId}`;

        try {

            if(await Reminder.findByIdAndDelete(id)) {
                await deleteKeysByPattern(cacheKey);
                return res.status(200).send({ status: true, message: 'Reminder deleted successfully.' });
            } else {
                return res.status(404).send({ status: false, message: 'Reminder not found.' });
            }

        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({status: false, message: 'Internal server error.'})
        }

    },

    postReminderTest: async (req, res) => {
        const userId = req.user.id;
        const roomId = crypto.createHash('sha256').update(userId).digest('hex');

        try {
            getIo().to(roomId).emit('newNotification', userId);
            return res.status(200).send({ status: true, message: 'Test notification sent successfully.' });
        } catch (e) {
            logger.error(e.toString());
            return res.status(500).send({ status: false, message: 'Internal server error.' });
        }
    }

}

module.exports = ReminderController;