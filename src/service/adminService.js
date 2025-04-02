const {generateNewClarusAccount, generateRelayerBitcoinAddress} = require('../generate_account');
const {User} = require("../schema.js");
const { InsertUserData, checkAddress } = require('../db');

const registerNewUser =async()=>{
    try {
        const clarusAccount = await generateNewClarusAccount();
        const recipientAddress = await generateRelayerBitcoinAddress();
        const userDetail = await InsertUserData(clarusAccount, recipientAddress);
        return userDetail
    } catch (error) {
        console.error("Error in registerNewUser:", error);
        throw error;
    }
}

module.exports ={
    registerNewUser: registerNewUser,
}
