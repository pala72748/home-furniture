const Admin = require('../models/admin');
const Admintoken = require('../models/admintoken');
const ProductCategory = require('../models/Productcategory'); // Correct the case here
const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const fs = require('fs')
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "dlchkufsu",
    api_key: "492799945774271",
    api_secret: "RUp7r-r7R3H_IccLn-YdBd3Akhw"
});

const category = multer.diskStorage({
    destination: './image/category',
    filename: function (req, file, cb) {
        const iname = shortid.generate();
        cb(null, iname + path.extname(file.originalname));
    }
});

const uploadcat = multer({
    storage: category,
    limits: { fileSize: 1024000 }
});

router.post('/category', uploadcat.single('cover'), async (req, res) => {
    const cat_name = req.body.cat_name;
    const cat_url = req.body.cat_url;
    const cover = req.file.filename;
    console.log(cat_name, cat_url, cover);
    const newCat = new ProductCategory({
        cat_name,
        cat_url,
        cover
    });
    newCat.save();
    res.json({ "sts": 0, "msg": "Category Uploaded" });
});

router.get('/getcategory', async (req, res) => {
    try {
        const cat = await ProductCategory.find();
        if (!cat || cat.length === 0) {
            return res.json({ "viewsts": 1, "msg": "No Category found" });
        } else {
            return res.json({ "viewsts": 0, cat });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ "viewsts": 1, "msg": "Internal Server Error" });
    }
});

router.get('/getcategory/:id', async (req, res) => {
    console.log(req.body);
    try {
        const cat = await ProductCategory.findById(req.params.id);
        res.status(200).json(cat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ "viewsts": 1, "msg": "Internal Server Error" });
    }
});

router.delete('/deletecategory/:id', async (req, res) => {
    try {
        const cat = await ProductCategory.findByIdAndDelete(req.params.id);
        
        if (!cat) {
            return res.json({ "detsts": 1, "msg": "Category not deleted" });
        } else {
            // Extract filename from the deleted category and construct imagePath
            const filename = cat.cover;
            const imagePath = path.join(__dirname, '../image/category', filename);

            // Check if the file exists before attempting to delete
            if (fs.existsSync(imagePath)) {
                // Delete the file
                fs.unlinkSync(imagePath);
                return res.status(200).json({ msg: 'Image and category deleted successfully' });
            } else {
                return res.status(404).json({ msg: 'Image not found, but category deleted' });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ "viewsts": 1, "msg": "Internal Server Error" });
    }
});

router.put('/updatecategory/:id', uploadcat.single('cover'), async (req, res) => {
    try {
        const { cat_name, cat_url } = req.body;
        const cover = req.file ? req.file.filename : null;

        const updatedCategory = await ProductCategory.findByIdAndUpdate(
            req.params.id,
            { cat_name, cat_url, cover },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ "updatests": 1, "msg": 'Deleted Sucessfully' });
        }

        res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
