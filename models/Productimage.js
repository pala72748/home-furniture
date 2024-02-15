const mongoose = require('mongoose');
const express = require('express');

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/furniture', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB User Schema
const productimageSchema = new mongoose.Schema({
  product_image: {
    type: String,
  },
  productid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'product',
  },
});


module.exports = mongoose.model('product_image', productimageSchema);