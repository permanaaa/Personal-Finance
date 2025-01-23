const bcrypt = require('bcryptjs');
const { postRegister } = require('../controllers/authController');
const User = require('../models/userModel');
const logger = require('../libs/winston');

jest.mock('../models/userModel');
jest.mock('bcryptjs');
jest.mock('../libs/winston');

describe('postRegister', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'securepassword123'
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should register a new user successfully', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashedPassword');
        User.prototype.save.mockResolvedValue();

        await postRegister(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 'salt');
        expect(User.prototype.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ status: true, message: 'registered successfully.' });
    });

    test('should return 400 if email already exists', async () => {
        User.findOne.mockResolvedValue({ email: req.body.email });

        await postRegister(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
        expect(bcrypt.genSalt).not.toHaveBeenCalled();
        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(User.prototype.save).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ status: false, message: 'email already exists.' });
    });

    test('should handle unexpected errors and return 500', async () => {
        User.findOne.mockRejectedValue(new Error('Database error'));

        await postRegister(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
        expect(bcrypt.genSalt).not.toHaveBeenCalled();
        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(User.prototype.save).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith('Error: Database error');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ status: false, message: 'internal server error.' });
    });
});
