const Admin = require('../models/admin');
const AdminToken = require('../models/admintoken');
const Blog = require('../models/Blog'); // Fixed the case here to match the file name
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

const blogStorage = multer.diskStorage({
  destination: './image/blog',
  filename: function (req, file, cb) {
    const imageName = shortid.generate();
    cb(null, imageName + path.extname(file.originalname));
  },
});

const uploadcat = multer({
  storage: blogStorage,
  limits: { fileSize: 1024000 },
});

router.post('/blog', uploadcat.single('cover'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'blog_images', // Specify folder in Cloudinary where images will be stored
    });
    const { blog_name, blog_url, blog_cat, blog_desc } = req.body;

    const newBlog = new Blog({
      blog_cat,
      blog_name,
      blog_url,
      blog_desc,
      cover,
    });

    await newBlog.save();

    res.json({ status: 0, msg: 'Blog Uploaded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 1, msg: 'Internal Server Error' });
  }
});

router.get('/getblog', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const size = req.query.page ? parseInt(req.query.size) : 9999999999;
    const skip = (page - 1) * size;
    const total = await Blog.countDocuments();
    const blogs = await Blog.find().skip(skip).limit(size).populate('blog_cat');

    if (!blogs || blogs.length === 0) {
      return res.json({ status: 1, msg: 'No blogs found', page, size });
    } else {
      const formattedBlogs = blogs.map(blog => ({
        _id: blog._id,
        blog_name: blog.blog_name,
        blog_url: blog.blog_url,
        blog_desc: blog.blog_desc,
        blog_cat: blog.blog_cat.blog_cat_name,
        cover: blog.cover,
      }));
      return res.json({ status: 0, blogs: formattedBlogs });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 1, msg: 'Internal Server Error' });
  }
});

router.get('/getblog/:blog_url', async (req, res) => {
  try {
    const blog = await Blog.findOne({ blog_url: req.params.blog_url }).populate('blog_cat');
    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 1, msg: 'Internal Server Error' });
  }
});

router.get('/getblog/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    res.status(200).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 1, msg: 'Internal Server Error' });
  }
});

router.delete('/deleteblog/:id', async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({ status: 1, msg: 'Blog not found' });
    }

    const filename = deletedBlog.cover;
    const imagePath = path.join(__dirname, '../image/blog', filename);

    if (await fs.access(imagePath).then(() => true).catch(() => false)) {
      await fs.unlink(imagePath);
      return res.status(200).json({
        status: 'success',
        message: 'Image and blog deleted successfully',
      });
    } else {
      return res.status(404).json({
        status: 'success',
        message: 'Blog deleted, but image not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

router.patch('/updateblog/:id', uploadcat.single('cover'), async (req, res) => {
  try {
    const { blog_name, blog_url, blog_desc } = req.body;
    let coverUrl;

    if (req.file) {
      // Upload updated image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'blog_images', // Specify folder in Cloudinary where images will be stored
      });
      coverUrl = result.secure_url;
    }

    const updatedFields = { blog_name, blog_url, blog_desc };
    if (coverUrl) {
      updatedFields.cover = coverUrl;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true },
    );

    if (!updatedBlog) {
      return res.status(404).json({ status: 1, msg: 'Blog not found' });
    }

    res.json(updatedBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 1, msg: 'Internal Server Error' });
  }
});


module.exports = router;