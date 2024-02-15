const mongoose = require('mongoose');
const express = require('express');

const app = express()

mongoose.connect('mongodb+srv://pala72748:root@home.7mh2fle.mongodb.net/furniture?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB User Schema
const productSchema = new mongoose.Schema({
  product_cat:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"product_cat"
  },
  product_name: {
    type: String,
  },
  product_url: {
    type: String,
  },
  product_desc: {
    type: String,
  },
  product_short_desc: {
    type: String,
  },
  cover: {
    type: String,
  },
});

productSchema.pre('find',function(next){
  this.populate('product_cat')
  next()
})

module.exports = mongoose.model('product', productSchema);
