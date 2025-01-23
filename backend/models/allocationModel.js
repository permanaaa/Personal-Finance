const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    name : {
        type : String,
        required : true,
        minLength : 5
    },
    budget : {
        type : Number,
        required : true,
        min : 1
    },
    type : {
        type : String,
        required : true,
        enum : ['income', 'expense']
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

module.exports = mongoose.model('Allocation', allocationSchema);