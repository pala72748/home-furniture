const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://pala72748:root@home.7mh2fle.mongodb.net/furniture?retryWrites=true&w=majority', {
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
