import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [4, 'name should be at least 4 characters'],
    maxLength: [40, 'name should not exceed limit of 40 characters'],
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String
  },
  password: {
    type: String,
    minLength: [8, 'password should be at least 8 characters'],
    maxLength: [80, 'password should not exceed limit of 80 characters'],
    required: true,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  address: [{
    contactPerson: {
      type: String,
      minLength: [4, 'name should be at least 4 characters'],
      maxLength: [40, 'name should not exceed limit of 40 characters'],
      trim: true
    },
    contactnumber: {
      type: String
    },
    addressLineOne: {
      type: String,
      required: true
    },
    addressLineTwo: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      minLength: [6, 'pincode should be at least 6 characters'],
      maxLength: [8, 'pincode should not exceed limit of 8 characters'],
    },
    locality: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'India'
    }
  }],
  dob: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  alternateContactNumber: {
    type: String
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
    maxLength: 3
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;