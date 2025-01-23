const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    allocationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Allocation',
        required : true
    },
    title : {
        type : String,
        required : true
    },
    amount : {
        type : Number,
        required : true,
        min : 1
    },
    dueDate : {
        type : Date,
        required : true
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

module.exports = mongoose.model('Reminder', reminderSchema);