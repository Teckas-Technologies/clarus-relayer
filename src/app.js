const axios = require('axios');
const BigNumber = require('bignumber.js');
const sendExtrinsic = require('./sign_trnsaction');
const generateNewAccount = require('./generate_account');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTransactionList(apiBaseUrl, address) {
  // Set up Esplora API endpoint
  const apiUrl = `${apiBaseUrl}/address/${address}/txs`;

  try {
    // Make the API call
    const response = await axios.get(apiUrl);

    // Return the list of transactions
    return response.data || [];
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

async function monitorTransactions(apiBaseUrl, listener_bitcoinAddress, intervalSeconds = 3) {
  while (true) {
    const transactions = await getTransactionList(apiBaseUrl, listener_bitcoinAddress);

    if (transactions) {
      console.log('Latest transactions:');
      transactions.forEach( async transaction => {
        console.log(`Transaction Hash: ${transaction.txid}, Amount: ${transaction.value / 100000000} BTC`);
        console.log("transaction: {:?}", transaction);
        if (transaction.status.confirmed) {
            let amount
            let clarus_gen_key
            transaction.vout.forEach ( async internal_trasnaction => {
                let senderBitcoinAddress = internal_trasnaction.scriptpubkey_address;
        
                if ( senderBitcoinAddress == listener_bitcoinAddress ) {
                  amount = internal_trasnaction.value;
                }
                else {
                  clarus_gen_key = await generateNewAccount();
                  if (amount > 0) {
                    console.log(`sender address: ${senderBitcoinAddress}`);
                    console.log(`amount: ${amount}`);
                    console.log(`clarus_gen_key: ${clarus_gen_key}`);
                    console.log(`clarus_gen_key address: ${clarus_gen_key.address}`);

                    const bitcoinAmountInSatoshis = new BigNumber(amount);
                    const bitcoinAmountInDecimal = bitcoinAmountInSatoshis.dividedBy(100000000).toString();
                    
                    console.log(`Bitcoin amount in decimal: ${bitcoinAmountInDecimal}`);
                    // Sign transaction to mint wrapped bitcoin
                    try {
                      await sendExtrinsic(senderBitcoinAddress, clarus_gen_key.address, bitcoinAmountInDecimal);
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

// Replace 'your_esplora_api_base_url' and 'your_bitcoin_address' with your actual Esplora API base URL and Bitcoin address
const esploraApiBaseUrl = 'https://blockstream.info/api';
const listener_bitcoinAddress = 'bc1qgug00ay025qmte7qtukl9w9r79maerh500rfad'; //'bc1qdsalrpytc29sqcpg3ydvnys7dzdlew4e352s4p';

monitorTransactions(esploraApiBaseUrl, listener_bitcoinAddress);
