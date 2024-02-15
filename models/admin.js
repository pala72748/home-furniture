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
const adminSchema = new mongoose.Schema({
  admin_user: {
    type: String,
    required:true,
  },
  admin_pass: {
    type: String,
    required:true,
  },
});


module.exports = mongoose.model('admin', adminSchema);



