const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    reminderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Reminder',
        required : true
    },
    status : {
        type : String,
        required : true,
        enum : ['read', 'unread']
    },
    createdAt : {
        type : Date,
        default : null
    },
    updatedAt : {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Notification', notificationSchema);