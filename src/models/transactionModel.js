const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAcount:{
        type:mongoose.Schema.Type.ObjectId,
        ref: "acount",
        required: [true, "Transaction must be associated with a from acount"],
        index: true
    },
    toAcount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "acount",
        required: [true, "Transaction must be associated with a to acount"],
        index: true
    },
    status:{
        type: String,
        enum:{
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status can be either PENDING, COMPLETED, FAILED or REVERSED"
        },
        default: "PENDING"
    },
    amount:{
        type: Number,
        required: [true, "Amount is required for creaing a transaction"],
        min: [0, "Transaction amount cannot be negative"]
    },
    idempotencyKey:{
        type: String,
        required: [true, "Idempotency key is required for creating a transaction"],
        index: true,
        unique: true
    }
},{timestamps: true}) 

const transactionModel = mongoose.model("transaction", transactionSchema);
module.exports = transactionModel 