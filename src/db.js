// Connection URI with SSL options
// import { connect, set, disconnect } from 'mongoose';
const { connect } = require('mongoose');
const {User, Transaction} = require('./schema');
const { db_url } = require('./config');

// Connect to MongoDB
const client = connect(db_url).catch(e => {
    console.log('CONNECTION ERROR IN DATABASE', e);
});

function InsertUserData(data, bitcoinAddress) {
        const newUser = new User({
            _recipientddress: bitcoinAddress,
            publicKey: data.pair.publicKey,
            mnemonic: data.mnemonic,
            ss58Address: data.pair.address
        });
        newUser.save()
            .then(() => {
                console.log('InsertUserData inserted successfully');
            })
            .catch(error => {
                // Handle duplicate key error
                if (error.code === 11000) {
                    console.error('Duplicate key error in User collection:', error.message);
                } else {
                    console.error('InsertUserDataError:', error);
                }
            });
        return newUser
}

async function countUser() {
    // Count the number of documents in the collection
    try {
        const count = await User.countDocuments({});
        console.log('Number of documents in the collection:', count);
        return count
    } catch (error) {
        console.error('countUserError:', error);
    }
}

function checkAddress(bitcoinAddress) {
    // Check for matching bitcoin address data in the collection
    const data = User.find({ ["_recipientddress"]: bitcoinAddress })
        .then(result => {
            if (result.length > 0) {
                console.log('Data exists in the collection.');
            } else {
                console.log('No data found in the collection.');
            }
            return result
        })
        .catch(err => {
            console.error('checkAddressError:', err);
        });
    return data
}

function getAllUsers() {
    // Check for matching bitcoin address data in the collection
    const data = User.find({ })
        .then(result => {
            if (result.length > 0) {
                console.log('Data exists in the collection.');
            } else {
                console.log('No data found in the collection.');
            }
            return result
        })
        .catch(err => {
            console.error('getAllUsersError:', err);
        });
    return data
}

function InsertTransactionData(id, blockNumber, amount, senderAddress, recipientAddress) {
    const newTrnx = new Transaction({
        _transactionId: id,
        amount: amount,
        senderAddress: senderAddress,
        recipientAddress: recipientAddress,
        blockNumber: blockNumber 
    });
    newTrnx.save()
        .then(() => {
            console.log(' InsertTransactionData inserted successfully');
        })
        .catch(error => {
              // Handle duplicate key error
              if (error.code === 11000) {
                console.error('Duplicate key error in Tranaction collection:', error.message);
                // Handle the error as needed (e.g., notify user, retry with different data)
            } else {
                console.error('InsertTransactionDataError:', error);
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
            console.error('getTransactionDataError:', err);
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
        console.log("removeTransactionDataError:", err);
    }finally {
        // Close the connection when finished
        await client.close;
    }
}
module.exports = {
    InsertUserData,
    checkAddress,
    getAllUsers,
    InsertTransactionData,
    removeTransactionData,
    getTransactionData,
    countUser,
};
