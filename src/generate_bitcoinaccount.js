const bip39 = require('bip39');
const bip32 = require('bip32');
const bitcoin = require('bitcoinjs-lib');

// Generate a random 12-word mnemonic (seed phrase)
const mnemonic = bip39.generateMnemonic();

// Derive the seed buffer from the mnemonic
const seedBuffer = bip39.mnemonicToSeedSync(mnemonic);

// Use bip32 module to derive the root key (HD wallet)
console.log(bip39)
const root = fromSeed(seedBuffer);

// Derive the first receiving address (index 0)
const child = root.derivePath("m/44'/0'/0'/0/0"); // BIP44 path for Bitcoin mainnet

// Get the public key from the child node
const publicKey = child.publicKey;

// Generate the Bitcoin address from the public key
const { address } = bitcoin.payments.p2pkh({ pubkey: publicKey });

console.log('Mnemonic:', mnemonic);
console.log('Address:', address);
