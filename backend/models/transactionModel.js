const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
    description:{
        type : String,
        required : true,
    },
    type : {
        type : String,
        required : true,
        enum : ['income', 'expense']
    },
    amount : {
        type : Number,
        required : true
    },
    date:{
        type: Date,
        required: true
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

module.exports = mongoose.model('Transaction', transactionSchema);