// Connection URI with SSL options
// import { connect, set, disconnect } from 'mongoose';
const { connect } = require('mongoose');
const {User, Transaction} = require('./schema');
const { db_url } = require('./config');

// Connect to MongoDB
const client = connect(db_url).catch(e => {
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
            .catch(error => {
                // Handle duplicate key error
                if (error.code === 11000) {
                    console.error('Duplicate key error in User collection:', error.message);
                    // Handle the error as needed (e.g., notify user, retry with different data)
                } else {
                    console.error('An error occurred:', error);
                }
            });
}

function checkAddress(bitcoinAddress) {
    // Check for matching bitcoin address data in the collection
    const data = User.find({ ["_bitcoinAddress"]: bitcoinAddress })
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
        .catch(error => {
              // Handle duplicate key error
              if (error.code === 11000) {
                console.error('Duplicate key error in Tranaction collection:', error.message);
                // Handle the error as needed (e.g., notify user, retry with different data)
            } else {
                console.error('An error occurred:', error);
            }
        });
}


function getTransactionData() {
    // Check for any data in the collection
    const data = Transaction.find({})
        .then(result => {
            if (result.length > 0) {
                console.log('Transaction data exists in the collection.');
            } else {
                console.log('No transaction data found in the collection.');
            }
            return result
        })
        .catch(err => {
            console.error('Error:', err);
        })
        .finally(async _ => {
            await client.close;
        })
    return data
}

async function removeTransactionData(trnxId) {

    try {   
        const result = await Transaction.deleteOne({ "_transactionId": trnxId })
        console.log(`${trnxId} ${result.deletedCount} document deleted successfully`);
    } catch (err) {
        console.log(err);
    }finally {
        // Close the connection when finished
        await client.close;
    }
}
module.exports = {
    InsertData,
    checkAddress,
    InsertTransaction,
    removeTransactionData,
    getTransactionData
};
