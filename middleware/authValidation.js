const joi = require("joi");
function signupValidation(req, res, next) {
  const schema = joi.object({
    name: joi.string().min(3).max(100).required(),
    email: joi
      .string()
      .custom((value, helpers) => {
        if (value === "admin@admin.com") {
          return value; // Allow admin email explicitly
        }
        // Validate all other emails using standard email format
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return value;
        }
        return helpers.error("any.invalid");
      })
      .required()
      .messages({
        "any.invalid": "Email must be valid or admin@admin.com",
      }),
    password: joi.string().min(4).max(100).required(),
    phone: joi
      .string()
      .pattern(/^\+?\d{10,15}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be valid (10-15 digits, optional +)",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
}

function loginValidation(req, res, next) {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).max(100).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({
        message: "Bad Request",
        error: error.details[0].message,
        success: false,
      });
  }
  next();
}

module.exports = { signupValidation, loginValidation };
