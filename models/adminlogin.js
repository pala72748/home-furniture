const Admin = require('../models/admin');
const Admintoken = require('../models/admintoken');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const SECRET_KEY = "jaishriram"

// http://localhost:3000/api/admin/login
router.post('/api/login', async (req, res) => {
    try {
        const newAdmin = new Admin({
            admin_user: req.body.admin_user,
            admin_pass: await bcrypt.hash(req.body.admin_pass, 12)
        })
        const saveAdmin = await newAdmin.save()
        res.status(200).json(saveAdmin)
    } catch (error) {
        res.status(500).json(error);
    }
})

router.post("/api/token", async (req, res) => {

    const admin_user = req.body.admin_user;
    const admin_pass = req.body.admin_pass;
    console.log(admin_user, admin_pass);

    try {
        const login = await Admin.findOne({ admin_user })
        console.log(login);
        if (!login) {
            return res.json({ "sts": 1, "msg": "Username not found" })
        } else {
            if (await bcrypt.compare(admin_pass, login.admin_pass)) {
                const token = jwt.sign({ adminid: login._id }, SECRET_KEY, { expiresIn: '6hr' })
                const expire = new Date(Date.now() + (6 * 60 * 60 * 1000))
                const admintokenSave = new Admintoken({
                    adminid: login._id,
                    token,
                    expire
                })
                const aid = login._id
                const auser = login.admin_user
                await admintokenSave.save()
                return res.json({ "sts": 0, aid, auser, token, "msg": "Login Sucess" })

            } else {
                return res.json({ "sts": 2, "msg": "Password is wrong" })
            }
        }
    } catch (error) {
        res.status(500).json({ 'error': error })
    }
})

router.post("/logout", async (req, res)=>{
    const token = req.body.token;
    try {
        const logout = await Admintoken.findOneAndDelete({ token })
        if (!logout) {
            return res.json({ "logoutsts": 1 })
        } else {
            return res.json({ "logoutsts": 0 })
        }
    } catch (error) {
        console.log(error);
    }
})
module.exports = router