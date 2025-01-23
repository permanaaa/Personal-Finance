const Joi = require('joi');

const transactionIdSchema = Joi.string().alphanum().length(24).required();
const allocationIdSchema = Joi.string().alphanum().length(24).required();
const typeSchema = Joi.string().valid('income', 'expense').required();
const amountSchema = Joi.number().min(1).required();
const descriptionSchema = Joi.string().min(5).max(50).regex(/^[A-Za-z0-9 ]+$/).required();
const dateSchema = Joi.date().required();
const pageParamsSchema = Joi.number().min(1).allow(null).default(1);
const perPageParamsSchema = Joi.number().min(1).allow(null).default(10);
const searchParamsSchema = Joi.string().allow(null, '').default(null);
const allocationIdParamsSchema = Joi.string().alphanum().length(24).allow(null, '', 'All').default(null);
const monthParamsSchema = Joi.number().min(1).max(12).allow(null).default(null);
const typeParamsSchema = Joi.string().valid('income', 'expense').allow(null, '', 'All').default(null);

const getAllTransactionsSchema = Joi.object({
    page: pageParamsSchema,
    perPage: perPageParamsSchema,
    search: searchParamsSchema,
    allocationId: allocationIdParamsSchema,
    month: monthParamsSchema,
    type: typeParamsSchema
});

const addTransactionSchema = Joi.object({
    allocationId : allocationIdSchema,
    type: typeSchema,
    amount: amountSchema,
    description: descriptionSchema,
    date:dateSchema
})

const transactionParamsSchema = Joi.object({
    id: transactionIdSchema
})

const updateTransactionSchema = Joi.object({
    allocationId: allocationIdSchema,
    type: typeSchema,
    amount: amountSchema,
    description: descriptionSchema,
    date:dateSchema
})

module.exports = {
    getAllTransactionsSchema,
    addTransactionSchema,
    transactionParamsSchema,
    updateTransactionSchema
}