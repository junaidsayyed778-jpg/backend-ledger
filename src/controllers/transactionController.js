const { default: mongoose } = require("mongoose");
const accountModel = require("../models/accountModel");
const transactionModel = require("../models/transactionModel");
const ledgerModel = require("../models/ledgerModel");
const emailService = require("../services/emailService");

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount, idempotencyKey is required",
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    if (!toUserAccount || !fromUserAccount) {
      return res.status(400).json({
        message: "Invalid fromAccount or toAccount",
      });
    }

    // Idempotency check
    const existingTxn = await transactionModel.findOne({ idempotencyKey });

    if (existingTxn) {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTxn,
      });
    }

    if (
      fromUserAccount.status !== "ACTIVE" ||
      toUserAccount.status !== "ACTIVE"
    ) {
      return res.status(400).json({
        message: "Accounts must be ACTIVE",
      });
    }

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance: ${balance}`,
      });
    }

    // ✅ Create transaction
    const [txn] = await transactionModel.create(
      [{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
      }],
      { session }
    );

    // ✅ Ledger entries (atomic)
    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: txn._id,
          type: "DEBIT",
        },
        {
          account: toAccount,
          amount,
          transaction: txn._id,
          type: "CREDIT",
        },
      ],
      { session, ordered: true }
    );

    // ✅ Update status
    txn.status = "COMPLETED";
    await txn.save({ session });

    await session.commitTransaction();
    session.endSession();

    await emailService.sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount,
      fromAccount
    );

    return res.status(201).json({
      message: "Transaction successful",
      transaction: txn,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than 0",
    });
  }

  const existingTxn = await transactionModel.findOne({ idempotencyKey });
  if (existingTxn) {
    return res.status(200).json({
      message: "Transaction already processed",
      transaction: existingTxn,
    });
  }

console.log("toAccount:", toAccount);

const toUserAccount = await accountModel.findById(toAccount);
console.log("toUserAccount:", toUserAccount);

const fromUserAccount = await accountModel.findOne({ user: req.user._id });
console.log("fromUserAccount:", fromUserAccount);
  if (!toUserAccount || !fromUserAccount) {
    return res.status(400).json({
      message: "Invalid accounts",
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [transaction] = await transactionModel.create(
      [
        {
          fromAccount: fromUserAccount._id,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING",
        },
      ],
      { session , ordered: true},
    );

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session ,  ordered: true},
    );

    fromUserAccount.balance -= amount;
    toUserAccount.balance += amount;

    await fromUserAccount.save({ session });
    await toUserAccount.save({ session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
}
module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
