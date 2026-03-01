const { default: mongoose } = require("mongoose");
const accountModel = require("../models/accountModel");
const transactionModel = require("../models/transactionModel");
const ledgerModel = require("../models/ledgerModel");
const emailService = require("../services/emailService");

async function createTransaction(req, res) {
  //1. Validate request
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  console.log("toAccount:", toAccount);
  console.log("toUserAccount:", toUserAccount);
  console.log("req.user:", req.user);
  console.log("fromUserAccount:", fromUserAccount);
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount, idempotencyKey is required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!toUserAccount || !fromUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAcount and toAccount",
    });
  }

  //02. validate idempotency key
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already proccessed",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still proccessing",
      });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction proccessing failed, please retry",
      });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  //03. // check acount status
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transaction",
    });
  }

  //04. Derive sender balance from ledger
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance} Requested amount is ${amount}`,
    });
  }
  //05. create transaction (PENDING)
  const session = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  //10. send email notification
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
    fromAccount,
  );
  res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
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
      { session },
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
