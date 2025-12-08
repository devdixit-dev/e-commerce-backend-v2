import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  image: {
    type: String,
    default: ''
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
}, {timestamps: true});

const Category = mongoose.model('Category', categorySchema);

export default Category;