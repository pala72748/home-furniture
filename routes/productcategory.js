const Admin = require('../models/admin');
const Admintoken = require('../models/admintoken');
const ProductCategory = require('../models/Productcategory'); // Correct the case here
const Product = require('../models/Product')
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
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'product_cat_images', // Specify folder in Cloudinary where images will be stored
        });
        const cat_name = req.body.cat_name;
        const cat_url = req.body.cat_url;
        const cover = result.secure_url; // Retrieve the secure URL of the uploaded image from Cloudinary
        const newCat = new ProductCategory({
            cat_name,
            cat_url,
            cover:result.secure_url,
        });
        await newCat.save();
        res.json({ "sts": 0, "msg": "Category Uploaded" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "sts": 1, "msg": "Internal Server Error" });
    }
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
router.get('/getcategory/:name', async (req, res) => {

    try {
        const cat = await ProductCategory.find({ cat_url: req.params.name });
        const product = await Product.find({product_cat:cat[0]._id});
        const count = cat.length
        if (!cat || cat.length === 0) {
            return res.json({ viewsts: 1, msg: 'No products found for this category' });
        }
        // console.log(product);
        res.status(200).json({ viewsts: 0, product, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ viewsts: 1, msg: 'Internal Server Error' });
    }
});
router.get('/getcategory/', async (req, res) => {
    console.log(req.body);
     const aid = req.params.aid; // Accessing 'aid' from the route parameters
   console.log("Requested product ID:", aid);
    try {
        const cat = await ProductCategory.findById(req.params.aid);
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
        let updateFields = { cat_name, cat_url };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'product_cat_images', // Specify folder in Cloudinary where images will be stored
            });
            updateFields.cover = result.secure_url; // Store secure URL of uploaded image from Cloudinary
        }

        const updatedCategory = await ProductCategory.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ updatests: 1, msg: 'Category not found' });
        }

        res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
