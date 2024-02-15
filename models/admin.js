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



