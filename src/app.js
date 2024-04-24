const express = require('express');
const axios = require('axios');
const BigNumber = require('bignumber.js');
const { sendExtrinsic, checkTransaction } = require('./sign_trnsaction');
const generateNewAccount = require('./generate_account');
const { esploraApiBaseUrl, relayer_bitcoinAddress } = require('./config');
const { InsertTransaction, getTransactionData, removeTransactionData, checkAddress } = require('./db');
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

async function getTransactionList(apiBaseUrl) {
  // Set up Esplora API endpoint
  const apiUrl = `${apiBaseUrl}/address/${relayer_bitcoinAddress}/txs`;

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

async function monitorTransactions(apiBaseUrl, intervalSeconds = 3) {
  while (true) {
    console.log('Monitor transaction:');
    const transactions = await getTransactionList(apiBaseUrl);

    if (transactions) {
      transactions.forEach(async transaction => {
        console.log(`Transaction Hash: ${transaction.txid}, Amount: ${transaction.value / 100000000} BTC`);
        // console.log("transaction: {:?}", transaction);
        if (transaction.status.confirmed) {
          let amount
          transaction.vout.forEach(async internal_trasnaction => {
            let senderBitcoinAddress = internal_trasnaction.scriptpubkey_address;

            if (senderBitcoinAddress == relayer_bitcoinAddress) {
              amount = internal_trasnaction.value;
            }
            else {
              if (amount > 0) {
                // console.log(`amount: ${amount}`);
                const bitcoinAmountInSatoshis = new BigNumber(amount);
                const bitcoinAmountInDecimal = bitcoinAmountInSatoshis.dividedBy(100000000).toString();
                // console.log(`Bitcoin amount in decimal: ${bitcoinAmountInDecimal}`);
                user_ss58_address = await generateNewAccount(senderBitcoinAddress);
                // console.log(`user_ss58_address address: ${user_ss58_address}`);

                // Sign transaction to mint wrapped bitcoin
                try {
                  const status = await checkTransaction(transaction.txid, amount);
                  if (!status) {
                    await InsertTransaction(transaction.txid, transaction.status.block_height, amount, senderBitcoinAddress);
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
          await sendExtrinsic(each_trnx.bitcoinAddress, user[0].ss58Address, each_trnx.amount, each_trnx._transactionId);
          console.log("Info: Transaction retried after fetching data from db");
        }
      }
      console.log('-----------------------------------\n');
    }
    await sleep(intervalSeconds * 100000);
  }

}

monitorTransactions(esploraApiBaseUrl);

retryTransaction();

