const { Keyring } = require('@polkadot/keyring');
const { mnemonicGenerate } = require('@polkadot/util-crypto');

function generateNewAccount() {
  // Generate a new mnemonic (24 words)
  const mnemonic = mnemonicGenerate();

  // Create a keyring instance
  const keyring = new Keyring({ type: 'sr25519' });

  // Add an account using the generated mnemonic
  const pair = keyring.createFromUri(mnemonic, {}, 'sr25519');

  // Print the address and mnemonic seed of the new account
  console.log('Address:', pair.address);
  console.log('Mnemonic Seed:', mnemonic);

  return pair
}

// Call the function to generate a new account
module.exports = generateNewAccount;







