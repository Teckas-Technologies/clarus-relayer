const express = require('express');
const userService = require("../service/userService.js")
const adminService = require("../service/adminService.js")
const router = express.Router();

router.get("/registerUser",async(req,res)=>{
    try {
        const users = await adminService.registerNewUser();
        res.status(200).send(users);
    } catch (error) {
        console.log(error);
    }
})



module.exports = router;