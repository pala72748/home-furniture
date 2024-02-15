const mongoose = require('mongoose');
const express = require('express');

const app = express()

mongoose.connect('mongodb+srv://pala72748:root@home.7mh2fle.mongodb.net/furniture?retryWrites=true&w=majority', {
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
