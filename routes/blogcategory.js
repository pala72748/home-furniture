const Admin = require('../models/admin');
const Admintoken = require('../models/admintoken');
const BlogCategory = require('../models/blogCategory'); // Correct the case here
const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const fs = require('fs').promises; // Import fs.promises for async file operations
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: "dlchkufsu",
    api_key: "492799945774271",
    api_secret: "RUp7r-r7R3H_IccLn-YdBd3Akhw"
});

const category = multer.diskStorage({
    destination: './image/blog-category',
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
            folder: 'blog_cat_images', // Specify folder in Cloudinary where images will be stored
        });
        const { blog_cat_name, blog_url } = req.body;

        const newCat = new BlogCategory({
            blog_cat_name,
            blog_url,
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
        const cat = await BlogCategory.find();
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
    try {
        const cat = await BlogCategory.findById(req.params.id);
        res.status(200).json(cat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ "viewsts": 1, "msg": "Internal Server Error" });
    }
});

router.delete('/deletecategory/:id', async (req, res) => {
    try {
        const blog = await BlogCategory.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({ "status": 1, "msg": "Category not found" });
        }

        const filename = blog.cover;
        const imagePath = path.join(__dirname, '../image/blog-category', filename);

        // Use fs.promises.access for async file existence check
        if (await fs.access(imagePath).then(() => true).catch(() => false)) {
            await fs.unlink(imagePath);
            return res.status(200).json({ status: 'success', message: 'Image and category deleted successfully' });
        } else {
            return res.status(404).json({ status: 'success', message: 'Category deleted, but image not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

router.put('/updatecategory/:id', uploadcat.single('cover'), async (req, res) => {
    try {
        const { blog_cat_name, blog_url } = req.body;
        let cover

        // Check if there's a file uploaded
        if (req.file) {
            // Upload image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'blog_cat_images', // Specify folder in Cloudinary where images will be stored
            });
            cover = result.secure_url; // Store secure URL of uploaded image from Cloudinary
        }

        const updatedCategory = await BlogCategory.findByIdAndUpdate(
            req.params.id,
            { blog_cat_name, blog_url, cover },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ "updatests": 1, "msg": 'Category not found' });
        }

        res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
