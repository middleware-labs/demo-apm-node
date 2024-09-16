// Post Schema
const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  content: {
    type: String,
    trim: true,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    trim: true,
    required: true,
  }
});

module.exports = mongoose.model("Post", postSchema);
