const { Keyring } = require('@polkadot/keyring');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const { mnemonicGenerate } = require('@polkadot/util-crypto');
const { countUser } = require('./db');
const {relayerMnemonic} = require('./config')

async function generateNewClarusAccount() {

  let pair;
  
  // Create a keyring instance
  const keyring = new Keyring({ type: 'sr25519' });

    // Generate a new mnemonic (24 words)
    const mnemonic = mnemonicGenerate();

    // Add an account using the generated mnemonic
    pair = keyring.createFromUri(mnemonic, {}, 'sr25519');

  return {
    pair: pair, mnemonic: mnemonic }
}

async function generateRelayerBitcoinAddress() {

  //bip39.generateMnemonic();

// Derive the seed buffer from the mnemonic
const seedBuffer = bip39.mnemonicToSeedSync(relayerMnemonic);

// Use bip32 module to derive the root key (HD wallet)
const root = bitcoin.bip32.fromSeed(seedBuffer);
let index = await countUser();
// Derive the receiving address at the current index
const path = `m/44'/0'/0'/0/${index}`; // BIP44 path for Bitcoin mainnet

// Derive the first receiving address (index 0)
const child = root.derivePath(path); // BIP44 path for Bitcoin mainnet

// Get the public key from the child node
const publicKey = child.publicKey;

// Generate the Bitcoin address from the public key
const { address } = bitcoin.payments.p2pkh({ pubkey: publicKey });

console.log('Address:', address);

return address
}

// Call the function to generate a new account
module.exports = {
  generateNewClarusAccount,
  generateRelayerBitcoinAddress
};







