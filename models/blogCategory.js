const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/furniture', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB User Schema
const blogcategorySchema = new mongoose.Schema({
  blog_cat_name: {
    type: String,
  },
  blog_url: {
    type: String,
  },
  cover: {
    type: String,
  },
});


module.exports = mongoose.model('blog_cat', blogcategorySchema);
