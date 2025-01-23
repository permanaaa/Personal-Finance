const Joi = require('joi');

const nameSchema = Joi.string()
    .pattern(/^[a-zA-Z ]+$/)
    .min(3)
    .max(30)
    .required();

const usernameSchema = Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(30)
    .required();

const emailSchema = Joi.string()
    .email()
    .required();

const passwordSchema = Joi.string()
    .min(6)
    .max(50)
    .regex(/^[A-Za-z0-9!@#$%^&*]+$/)
    .required();


const registerSchema = Joi.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema
});

const loginSchema = Joi.object({
    email: emailSchema,
    password: passwordSchema
});

module.exports = {
    registerSchema,
    loginSchema
}