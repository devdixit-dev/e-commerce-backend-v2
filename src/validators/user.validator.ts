import Joi from "joi";

export const updateDataSchema = Joi.object({
  contactNumber: Joi.string().min(10).max(14).messages({
    "string.min": "Contact number should have at least 10 numbers",
    "string.max": "Contact number not over exceed 14 numbers"
  }),
  dob: Joi.string(),
  gender: Joi.string(),
  alternateContactNumber: Joi.string().min(10).max(14).messages({
    "string.min": "Alternate contact number should have at least 10 numbers",
    "string.max": "Alternate contact number not over exceed 14 numbers"
  })
});