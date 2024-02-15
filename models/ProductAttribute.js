const mongoose = require('mongoose');
const express = require('express');

const app = express()

mongoose.connect('mongodb+srv://pala72748:root@home.7mh2fle.mongodb.net/furniture?retryWrites=true&w=majority', {
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
