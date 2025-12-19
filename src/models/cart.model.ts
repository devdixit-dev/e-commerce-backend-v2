import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  productName: {
    type: String,
    trim: true,
    required: true
  },
  productStock: {
    type: Number,
    default: 0,
    min: 0,
    required: true
  },
  productQuantity: {
    type: Number,
    min: 1,
    default: 1,
    required: true
  },
  productPrice: {
    type: Number,
    min: 1,
    required: true
  },
  totalAmount: {
    type: Number,
    min: 1,
    default: 0,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;