const Joi = require('joi');

const notificationIdSchema = Joi.string().alphanum().length(24).required();
const pageParamsSchema = Joi.number().min(1).allow(null).default(1);
const perPageParamsSchema = Joi.number().min(1).allow(null).default(10);
const actionSchema = Joi.string().valid('read', 'delete').required();

const getAllNotificationsSchema = Joi.object({
    page: pageParamsSchema,
    perPage: perPageParamsSchema
});

const notificationParamsSchema = Joi.object({
    id: notificationIdSchema
});

const updateOrDeleteNotificationSchema = Joi.object({
    action: actionSchema
});

module.exports = {
    getAllNotificationsSchema,
    notificationParamsSchema,
    updateOrDeleteNotificationSchema
}