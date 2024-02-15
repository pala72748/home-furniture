const mongoose = require('mongoose');
const express = require('express');

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/furniture', {
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