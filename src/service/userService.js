const {User} = require("../schema.js");
const getUser =async(bitcoinAddress)=>{
    try {
        const userDetails = await User.findOne({ _bitcoinAddress: bitcoinAddress });
        return userDetails;
    } catch (error) {
        console.error("Error in getUser:", error);
        throw error;
    }
}

const getAllUsers =async()=>{
    try {
        const userDetails = await User.find({});;
        return userDetails;
    } catch (error) {
        console.error("Error in getUsers:", error);
        throw error;
    }
}

module.exports ={
    getUser: getUser,
    getAllUsers: getAllUsers
}