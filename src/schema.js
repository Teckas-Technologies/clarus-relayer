const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	_recipientddress: { type: String, required: true, unique: true },
	publicKey: String,
	mnemonic: { type: String, required: true, unique: true },
	ss58Address: { type: String, required: true, unique: true },
});

const User = mongoose.model(
	'BTCUser', UserSchema, 'BTCUsers');

const TransactionSchema = new mongoose.Schema({
	_transactionId: { type: String, required: true, unique: true }, 
	amount: Number,
	senderAddress: String,
	recipientAddress: String,
	blockNumber: Number
});

const Transaction = mongoose.model(
	'RelayerTransaction', TransactionSchema, 'RelayerTransactions');

	module.exports = {
		User,
		Transaction
	}