import Joi from "joi";

export const authInitSchema = Joi.object({
  name: Joi.string().min(4).max(40).required().messages({
    "string:emptry": "Name is required",
    "string:min": "Name should have at least 4 characters",
    "string:max": "Name should not over exceed 40 characters"
  }),
  email: Joi.string().required().messages({
    "number.empty": "Mobile number is required"
  }),
  password: Joi.string().min(8).required().messages({
    "password:empty": "Password is required",
    "password:min": "Password have at least 8 characters"
  })
});

export const signInSchema = Joi.object({
  email: Joi.string().required().messages({
    "number.empty": "Mobile number is required"
  }),
  password: Joi.string().min(8).required().messages({
    "password:empty": "Password is required",
    "password:min": "Password have at least 8 characters"
  })
})