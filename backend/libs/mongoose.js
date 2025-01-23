const dotenv = require('dotenv');
const { mongoose } = require('mongoose');

dotenv.config();
const URL = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;

const connectDB = async () => {
    try {
        await mongoose.connect(URL);
        console.log('Connected to MongoDB Successfully.');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
