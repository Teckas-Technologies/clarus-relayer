const express = require('express');
const userService = require("../service/userService.js")
const router = express.Router();

router.get("/:bitcoinAddress",async(req,res)=>{
    try {
        const user = await userService.getUser(req.params.bitcoinAddress);
        if(user){
        res.status(200).send(user);
        }else{
            res.status(404).send();
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/",async(req,res)=>{
    try {
        const users = await userService.getAllUsers();
        res.status(200).send(users);
    } catch (error) {
        console.log(error);
    }
})



module.exports = router;