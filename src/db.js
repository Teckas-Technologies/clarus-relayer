// const { MongoClient } = require('mongodb');
// const fs = require('fs');

// Connection URI with SSL options
// import { connect, set, disconnect } from 'mongoose';
const { connect } = require('mongoose');
const {User, Transaction} = require('./schema');
const { db_url } = require('./config');

// Connect to MongoDB
connect(db_url).catch(e => {
    console.log('CONNECTION ERROR IN DATABASE', e);
});

async function connectToDatabase() {

    const dbConnection = await connect(db_url).catch(e => {
        console.log('CONNECTION ERROR IN DATABASE', e);
    });
}

function InsertData(pair, mnemonic, bitcoinAddress) {
        const newUser = new User({
            _bitcoinAddress: bitcoinAddress,
            publicKey: pair.publicKey,
            mnemonic: mnemonic,
            ss58Address: pair.address
        });
        newUser.save()
            .then(() => {
                console.log('Data inserted successfully');
            })
            .catch(err => {
                console.error('Error inserting document:', err);
            });
}

function checkAddress(bitcoinAddress) {
    // Check for any data in the collection
    const data = User.find({ ["BitcoinAddress"]: bitcoinAddress })
        .then(result => {
            if (result.length > 0) {
                console.log('Data exists in the collection.');
            } else {
                console.log('No data found in the collection.');
            }
            return result
        })
        .catch(err => {
            console.error('Error:', err);
        });
    return data
}

function InsertTransaction(id, blockNumber, amount, bitcoinAddress) {
    const newTrnx = new Transaction({
        _transactionId: id,
        amount: amount,
        bitcoinAddress: bitcoinAddress,
        blockNumber: blockNumber
    });
    newTrnx.save()
        .then(() => {
            console.log('Data inserted successfully');
        })
        .catch(err => {
            console.error('Error inserting document:', err);
        });
}

module.exports = {
    InsertData,
    checkAddress,
    InsertTransaction
};
