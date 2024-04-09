
// Replace 'your_esplora_api_base_url' and 'your_bitcoin_address' with your actual Esplora API base URL and Bitcoin address
const esploraApiBaseUrl = 'https://blockstream.info/api';
// Relayer bitcoin address
const relayer_bitcoinAddress = 'bc1qgug00ay025qmte7qtukl9w9r79maerh500rfad'; //'bc1qdsalrpytc29sqcpg3ydvnys7dzdlew4e352s4p';
// Relayer seed phrase
const seedPhrase = 'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Bob';
// Substrate wss url
const node_url = 'ws://127.0.0.1:9944';
// MongoDb Url
const db_url = 'mongodb+srv://chatapi_prod_db_usr:bpBu539780ngQc26@myidcommunity-DB-240281f1.mongo.ondigitalocean.com/my_database?tls=true&authSource=admin';
module.exports = {
    esploraApiBaseUrl,
    relayer_bitcoinAddress,
    seedPhrase,
    node_url,
    db_url
}