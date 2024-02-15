const mongoose = require('mongoose');
const express = require('express');

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/furniture', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB User Schema
const productattributeSchema = new mongoose.Schema({
  attribute_name: {
    type: String,
  },
  attribute_value: {
    type: String,
  },
  attribute_unit: {
    type: String,
  },
  productid:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'product',
},
});


module.exports = mongoose.model('product_attribute', productattributeSchema);