const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { node_url, seedPhrase} = require('./config');

async function sendExtrinsic(receiverBitcoinAddress, receiverClarusAddress, amount, trnxId) {
  const provider = new WsProvider(node_url);

  // Create an API instance
  const api = await ApiPromise.create({ provider });

  // Create a keyring from the seed phrase
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri(seedPhrase);

  const assetid = 1;
  console.log("receiverBitcoinAddress: ", receiverBitcoinAddress, " receiverClarusAddress: ", receiverClarusAddress, " amount: ", amount);
  const transferExtrinsic = api.tx.relayer.mintWrapperToken(assetid, receiverClarusAddress, amount, receiverBitcoinAddress, trnxId);

  try {
    await transferExtrinsic.signAndSend(account, (result) => 
    {
      console.log("Result: ", result.status.type, ", Userid: ",account.address, ", user-name: ", account.name)
    })
  } catch (err) {
    console.log("Error: Account ", account.address, "Action name: MintToken")
    console.log("Error: ", err.toString());
  }
}

async function checkTransaction(trnxHash, amount) {
  const provider = new WsProvider(node_url);

  // Create an API instance
  const api = await ApiPromise.create({ provider });

  const trnx_exist = await api.query.relayer.bitcoinTranxId(trnxHash);
  if (trnx_exist == amount) {
    return true
  }
  else {
    false
  }
}

module.exports = {
  sendExtrinsic,
  checkTransaction
};