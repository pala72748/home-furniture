const mongoose = require('mongoose');
const express = require('express');

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/furniture', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB User Schema
const blogSchema = new mongoose.Schema({
  blog_cat:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"blog_cat"
  },
  blog_name: {
    type: String,
  },
  blog_url: {
    type: String,
  },
  blog_desc: {
    type: String,
  },
  cover: {
    type: String,
  },
});

blogSchema.pre('find',function(next){
  this.populate('blog_cat')
  next()
})

module.exports = mongoose.model('blog', blogSchema);