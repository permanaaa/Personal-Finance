const Joi = require('joi');

const reminderIdSchema = Joi.string().alphanum().length(24).required();
const allocationIdSchema = Joi.string().alphanum().length(24).required();
const titleSchema = Joi.string().regex(/^[A-Za-z0-9 ]+$/).min(5).max(50).required();
const amountSchema = Joi.number().min(1).required();
const dueDateSchema = Joi.date().required();
const pageParamsSchema = Joi.number().min(1).allow(null, '').default(1);
const perPageParamsSchema = Joi.number().min(1).allow(null, '').default(10);
const searchParamsSchema = Joi.string().allow(null, '').default(null);
const allocationIdParamsSchema = Joi.string().alphanum().length(24).allow(null, '', 'All').default(null);

const getAllRemindersSchema = Joi.object({
    page: pageParamsSchema,
    perPage: perPageParamsSchema,
    search: searchParamsSchema,
    allocationId: allocationIdParamsSchema
});

const addReminderSchema = Joi.object({
    allocationId : allocationIdSchema,
    title : titleSchema,
    amount : amountSchema,
    dueDate : dueDateSchema
});

const reminderParamsSchema = Joi.object({
    id : reminderIdSchema
});

const updateReminderSchema = Joi.object({
    allocationId : allocationIdSchema,
    title : titleSchema,
    amount : amountSchema,
    dueDate : dueDateSchema
});

module.exports = {
    getAllRemindersSchema,
    addReminderSchema,
    reminderParamsSchema,
    updateReminderSchema
}