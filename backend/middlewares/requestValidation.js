const validateRequest = (schema, param = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[param], { stripUnknown: true });

        if (error) {
            return res.status(400).send({ status: false, message: error.details[0].message });
        }

        req[param] = value;
        next();
    };
};

module.exports = validateRequest;
