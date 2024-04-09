const axios = require('axios');
const BigNumber = require('bignumber.js');
const sendExtrinsic = require('./sign_trnsaction');
const generateNewAccount = require('./generate_account');
const { esploraApiBaseUrl, relayer_bitcoinAddress} = require('./config');
const { InsertTransaction } = require('./db');

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
    const transactions = await getTransactionList(apiBaseUrl);

    if (transactions) {
      console.log('Latest transactions:');
      transactions.forEach( async transaction => {
        console.log(`Transaction Hash: ${transaction.txid}, Amount: ${transaction.value / 100000000} BTC`);
        console.log("transaction: {:?}", transaction);
        if (transaction.status.confirmed) {
            let amount
            transaction.vout.forEach ( async internal_trasnaction => {
                let senderBitcoinAddress = internal_trasnaction.scriptpubkey_address;
        
                if ( senderBitcoinAddress == relayer_bitcoinAddress ) {
                  amount = internal_trasnaction.value;
                }
                else {
                  if (amount > 0) {
                    console.log(`sender address: ${senderBitcoinAddress}`);
                    console.log(`amount: ${amount}`);
                    const bitcoinAmountInSatoshis = new BigNumber(amount);
                    const bitcoinAmountInDecimal = bitcoinAmountInSatoshis.dividedBy(100000000).toString();
                    console.log(`Bitcoin amount in decimal: ${bitcoinAmountInDecimal}`);
                    user_ss58_address = await generateNewAccount(senderBitcoinAddress);
                    console.log(`user_ss58_address address: ${user_ss58_address}`);

                    // Sign transaction to mint wrapped bitcoin
                    try {
                      await InsertTransaction(transaction.txid, transaction.status.block_height, amount, senderBitcoinAddress);
                      await sendExtrinsic(senderBitcoinAddress, user_ss58_address, amount);

                    }
                    catch (err) {
                      console.log(`Signing error: ${err}`)
                    }
                  }
                }
            })
            
            console.log("confirmed");
        }
      });
      console.log('\n');
    }

    await sleep(intervalSeconds * 100000);
  }
}

monitorTransactions(esploraApiBaseUrl);
