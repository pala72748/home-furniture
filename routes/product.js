const Admin = require('../models/admin');
const AdminToken = require('../models/admintoken'); 
const Product = require('../models/Product'); // Corrected case here
const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const fs = require('fs').promises;
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: "dlchkufsu",
  api_key: "492799945774271",
  api_secret: "RUp7r-r7R3H_IccLn-YdBd3Akhw"
});

const productStorage = multer.diskStorage({
  destination: './image/product',
  filename: function (req, file, cb) {
    const imageName = shortid.generate(); // Changed variable name to follow camelCase
    cb(null, imageName + path.extname(file.originalname));
  },
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 1024000 },
});

router.post('/product', uploadProduct.single('cover'), async (req, res) => {
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'product_images', // Specify folder in Cloudinary where images will be stored
    });
    const {
      product_name,
      product_url,
      product_cat,
      product_desc,
      product_short_desc,
    } = req.body;

    // Create new Product document
    const newProduct = new Product({
      product_cat,
      product_name,
      product_url,
      product_desc,
      product_short_desc,
      cover: result.secure_url, // Store secure URL of uploaded image from Cloudinary
    });

    // Save the new Product document
    await newProduct.save();

    res.json({ sts: 0, msg: 'Product Uploaded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ sts: 1, msg: 'Internal Server Error' });
  }
});

router.get('/getproduct', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const size = req.query.page ? parseInt(req.query.size) : 9999999999;
    const skip = (page - 1) * size;
    const total = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(size).populate('product_cat');
    if (!products || products.length === 0) {
      return res.json({ viewsts: 1, msg: 'No product found',page,size });
    } else {
      const formattedProducts = products.map(product => ({
        _id: product._id,
        product_name: product.product_name,
        product_url: product.product_url,
        product_desc: product.product_desc,
        product_cat: product.product_cat.cat_name,
        product_short_desc: product.product_short_desc,
        cover: product.cover,
      }));
      return res.json({ viewsts: 0, products: formattedProducts });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ viewsts: 1, msg: 'Internal Server Error' });
  }
});

router.get('/getproduct/:product_url', async (req, res) => {
  try {
    const product = await Product.findOne({ product_url: req.params.product_url }).populate('product_cat'); // Changed "findByOne" to "findOne"
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ viewsts: 1, msg: 'Internal Server Error' });
  }
});

router.get('/getproduct/:product_cat', async (req, res) => {
  try {
    const product = await Product.findOne({ product_cat: req.params.product_cat }).populate('product_cat'); // Changed "findByOne" to "findOne"
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ viewsts: 1, msg: 'Internal Server Error' });
  }
});

router.get('/getproduct/', async (req, res) => {
  console.log(req.params);
  const aid = req.params.aid; // Accessing 'aid' from the route parameters
  console.log("Requested product ID:", aid);
  try {
    const product = await Product.findById(aid);
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ viewsts: 1, msg: 'Internal Server Error' });
  }
});

router.delete('/deleteproduct/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 1, msg: 'Product not found' });
    }

    const filename = product.cover;
    const imagePath = path.join(__dirname, '../image/product', filename);

    if (
      await fs
        .access(imagePath)
        .then(() => true)
        .catch(() => false)
    ) {
      await fs.unlink(imagePath);
      return res.status(204).end();
    } else {
      return res.status(404).json({
        status: 'success',
        message: 'Product deleted, but image not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

router.patch('/updateproduct/:id', uploadProduct.single('cover'), async (req, res) => {
  try {
    const { product_name, product_url, product_desc, product_short_desc } = req.body;
    let updateFields = { product_name, product_url, product_desc, product_short_desc };

    if (req.file) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'product_images', // Specify folder in Cloudinary where images will be stored
      });
      
      // Add cover field to updateFields with secure URL from Cloudinary
      updateFields.cover = result.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ updatests: 1, msg: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
