const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	_bitcoinAddress: { type: String, required: true, unique: true },
	publicKey: String,
	mnemonic: String,
	ss58Address: String
});

const User = mongoose.model(
	'BTCUser', UserSchema, 'BTCUsers');

const TransactionSchema = new mongoose.Schema({
	_transactionId: { type: String, required: true, unique: true }, 
	amount: Number,
	bitcoinAddress: String,
	blockNumber: Number
});

const Transaction = mongoose.model(
	'RelayerTransaction', TransactionSchema, 'RelayerTransactions');

	module.exports = {
		User,
		Transaction
	}