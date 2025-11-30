import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productSlug: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  productBrand: {
    type: String,
    required: true,
    index: true
  },
  productPrice: {
    type: String,
    index: true,
    required: true,
  },
  productTags: {
    type: String,
    index: true
  },
  productCategory: {
    type: String,
    index: true,
    required: true
  },
  productDesc: {
    type: String,
    required: true,
    minLength: [12, 'Product description should have minimum 12 character'],
    maxLength: [200, 'Product description characters should not exceed limit of 200']
  },
  productRatings: {
    type: String,
    default: 0,
    index: true
  },
  productImages: [{
    type: String,
    trim: true,
    required: true
  }],
  productOwnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  productStock: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
  productReviewCount: {
    type: Number
  },
  productReviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  productViews: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    index: true,
    default: 0 
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

productSchema.index({ productCategory: 1, isActive: 1, productPrice: 1  });
productSchema.index({ productBrand: 1, isActive: 1 });
productSchema.index({ productName: 'text', productDesc: 'text', productTags: 'text' });
productSchema.index({ totalSales: -1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;