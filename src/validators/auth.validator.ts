import Joi from "joi";

export const registerOrLoginSchema = Joi.object({
  email: Joi.number().min(10).required().messages({
    "number.empty": 'Mobile number is required',
    "number.min": 'Mobile number should have at least 10 numbers'
  })
});

export const verifyOtp = Joi.object({
  otp: Joi.number().min(6).max(8).required().messages({
    "number.empty": 'Verification OTP is required',
    "number.min": 'Verification OTP should have at least 6 numbers',
    "number.max": 'Verification OTP should not over exceed 8 numbers'
  })
});