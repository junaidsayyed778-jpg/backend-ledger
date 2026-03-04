const { default: mongoose } = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true
    },
    amount:{
        type:Number,
        required: [true, "Amout is required for creating a ledger entry"],
        immutable: true
    },
    transaction: {
        type: String,
        ref: "transaction",
        required: [true, "Ledger must be assocaited with a transaction"],
        index: true,
        immutable: true
    },
    type:{
          type:String,
          enum:{
            values:["CREDIT", "DEBIT"],
            meesage:"Type can be either CREDIT or DEBIT"
          },
          required: [true, "Ledger type is required"],
          immutable: true
    }
})

function preventLedgerModification(){
    throw new Error ("Ledger entries are immutable and cannot be modified or delete")
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("updateManu", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification)
ledgerSchema.pre("findOneAndReplace", preventLedgerModification)

const ledgerModel = mongoose.model("ledger", ledgerSchema)
module.exports = ledgerModel;