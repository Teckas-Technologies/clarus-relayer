const { Keyring } = require('@polkadot/keyring');
const { mnemonicGenerate } = require('@polkadot/util-crypto');
const { InsertData, checkAddress } = require('./db');

async function generateNewAccount(bitcoinAddress) {

  const db_data = await checkAddress(bitcoinAddress)
  
  let pair;
  
  // Create a keyring instance
  const keyring = new Keyring({ type: 'sr25519' });
 
  if (db_data.length > 0) {
    console.log(db_data)
    pair = keyring.createFromUri(db_data[0].mnemonic, {}, 'sr25519');
  }
  else {

    // Generate a new mnemonic (24 words)
    const mnemonic = mnemonicGenerate();

    // Add an account using the generated mnemonic
    pair = keyring.createFromUri(mnemonic, {}, 'sr25519');

    try {
      await InsertData(pair, mnemonic, bitcoinAddress);
    }
    catch (err) {
      console.log("Data insertion to db failed", err)
    }
  }

  return pair.address
}

// Call the function to generate a new account
module.exports = generateNewAccount;







