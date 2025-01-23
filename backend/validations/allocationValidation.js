const Joi = require('joi');

const allocationIdSchema = Joi.string().alphanum().length(24).required();
const nameSchema = Joi.string().regex(/^[A-Za-z0-9 ]+$/).min(5).required();
const budgetSchema = Joi.number().min(1).required();
const pageSchema = Joi.number().min(1).allow(null).default(1);
const perPageSchema = Joi.number().min(1).allow(null).default(10);
const searchSchema = Joi.string().allow(null, '').default(null);
const typeSchema = Joi.string().valid('income', 'expense').required();
const monthSchema = Joi.number().min(1).max(12).required();

const getAllocationSchema = Joi.object({
    page : pageSchema,
    perPage : perPageSchema,
    search : searchSchema,
    month : monthSchema
});

const addAllocationSchema = Joi.object({
    name : nameSchema,
    budget : budgetSchema,
    type : typeSchema
});

const allocationParamsSchema = Joi.object({
    id : allocationIdSchema
});

const updateAllocationSchema = Joi.object({
    name : nameSchema,
    budget : budgetSchema,
    type : typeSchema
});

module.exports = {
    getAllocationSchema,
    addAllocationSchema,
    allocationParamsSchema,
    updateAllocationSchema
}