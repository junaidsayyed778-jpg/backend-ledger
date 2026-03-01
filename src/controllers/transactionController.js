const { default: mongoose } = require("mongoose");
const accountModel = require("../models/accountModel");
const transactionModel = require("../models/transactionModel");
const ledgerModel = require("../models/ledgerModel");

async function createTransaction(req, res){

    //1. Validate request
    const { fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"fromAccount, toAccount, amount, idempotencyKey is required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })
    if(!toUserAccount || !fromUserAccount){
        return res.status(400).json({
            message: "Invalid fromAcount and toAccount"
        })
    }

    //02. validate idempotency key
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already proccessed",
                transaction: isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still proccessing"
            })
        }
        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction proccessing failed, please retry"
            })
        }
        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }

    //03. // check acount status
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    //04. Derive sender balance from ledger
    const balance = await fromUserAccount.getBalance()

    if(balance < amount ){
        res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance} Requested amount is ${amount}`
        })
    }
    //05. create transaction (PENDING)
    const session = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }, {session});

    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }, {session});

    const creditLedgerEntry = await ledgerModel.create({
        account:toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
    }, {session});

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    //10. send email notification
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount, fromAccount);
    res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
    
}

module.exports = {
    createTransaction
}