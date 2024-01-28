const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

async function sendExtrinsic(receiverBitcoinAddress, receiverClarusAddress, amount) {
  const provider = new WsProvider('ws://127.0.0.1:9944');

  // Create an API instance
  const api = await ApiPromise.create({ provider });

  const seedPhrase = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Bob';

  // Create a keyring from the seed phrase
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri(seedPhrase);

  const assetid = 1;
  console.log("receiverBitcoinAddress: ", receiverBitcoinAddress, " receiverClarusAddress: ", receiverClarusAddress, " amount: ", amount);
  const transferExtrinsic = api.tx.relayer.mintWrapperToken(assetid, receiverClarusAddress, amount, receiverBitcoinAddress);

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

module.exports = sendExtrinsic;