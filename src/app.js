const express = require('express');
const axios = require('axios');
const BigNumber = require('bignumber.js');
const { sendExtrinsic, checkTransaction } = require('./sign_trnsaction');
const generateNewAccount = require('./generate_account');
const { esploraApiBaseUrl, relayer_bitcoinAddress } = require('./config');
const { InsertTransaction, getTransactionData, removeTransactionData, checkAddress, getAllUsers } = require('./db');
const userController = require("./controller/userController.js");
const PORT = parseInt(
  "3000",
 10
);

const app = express();
app.listen(PORT);

app.use("/api/v1/users",userController);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTransactionList(listener_address) {
  // Set up Esplora API endpoint
  const apiUrl = `${esploraApiBaseUrl}/address/${listener_address}/txs`;

  try {
    // Make the API call
    const response = await axios.get(apiUrl);

    // Return the list of transactions
    return response.data || [];
  } catch (error) {
    console.error(`Eror: ${error.message}`);
    return null;
  }
}

async function monitorTransactions(intervalSeconds = 3) {
  while (true) {
    console.log('Monitor transaction:');

    const users = await getAllUsers();
    for (let i = 0; i < users.length; i++) {

      const transactions = await getTransactionList(users[i]._recipientddress);
      const user_ss58_address = users[i].ss58Address;
      if (transactions) {
        transactions.forEach(async transaction => {
          console.log("transaction: {:?}", transaction);
          let senderBitcoinAddress = transaction.vin[0].prevout.scriptpubkey_address;
          console.log("prevout: ", transaction.vin[0].prevout)
          if (transaction.status.confirmed) {
            console.log(`Transaction Hash: ${transaction.txid}, Amount: ${transaction.value / 100000000} BTC`);
            let amount
            transaction.vout.forEach(async internal_trasnaction => {
              let recipientBitcoinAddress = internal_trasnaction.scriptpubkey_address;

              if (recipientBitcoinAddress == users[i]._recipientddress) {
                amount = internal_trasnaction.value;
              }
              else {
                if (amount > 0) {
                  // console.log(`amount: ${amount}`);
                  const bitcoinAmountInSatoshis = new BigNumber(amount);
                  const bitcoinAmountInDecimal = bitcoinAmountInSatoshis.dividedBy(100000000).toString();
                  // console.log(`Bitcoin amount in decimal: ${bitcoinAmountInDecimal}`);
                  // todofetch address from db

                  console.log(`| user_ss58_address: ${user_ss58_address} || senderBitcoinAddress: ${senderBitcoinAddress} |\n| amount: ${amount} || transaction.txid: ${transaction.txid} |`)
                  // Sign transaction to mint wrapped bitcoin
                  try {
                    const status = await checkTransaction(transaction.txid, amount);
                    if (!status) {
                      await InsertTransaction(transaction.txid, transaction.status.block_height, amount, senderBitcoinAddress, users[i]._recipientddress);
                      await sendExtrinsic(senderBitcoinAddress, user_ss58_address, amount, transaction.txid);
                    }
                    else {
                      console.log("Info: Transation already executed in node")
                    }
                  }
                  catch (err) {
                    console.log(`Signing error: ${err}`)
                  }
                }
              }
            })
          }
        });
        console.log('-----------------------------------\n');
      }
    }

    await sleep(intervalSeconds * 100000);
  }
}

async function retryTransaction(intervalSeconds = 5) {

  while (true) {
    console.log("Retry mechanism")
    const trnxs = await getTransactionData();
    console.log("Db Transaction collection:", trnxs);
    if (trnxs.length > 0) {
      for (let i = 0; i < trnxs.length; i++) {
        let each_trnx = trnxs[i];
        const status = await checkTransaction(each_trnx._transactionId, each_trnx.amount);
        if (status) {
          await removeTransactionData(each_trnx._transactionId)
          console.log("Info: Transaction info removed from db collection");
        }
        else {
          let user = await checkAddress(each_trnx.bitcoinAddress);
          if (user.length > 0) {
            await sendExtrinsic(each_trnx.senderAddress, user[0].ss58Address, each_trnx.amount, each_trnx._transactionId);
            console.log("Info: Transaction retried after fetching data from db");
          }

        }
      }
      console.log('-----------------------------------\n');
    }
    await sleep(intervalSeconds * 100000);
  }

}

monitorTransactions();

retryTransaction();

