const { body, validationResult } = require("express-validator");

const registerValidation = [
  body("name")
  .trim()
  .notEmpty()
  .withMessage("Name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("rollNo")
  .trim()
  .notEmpty()
  .withMessage("Roll number is required"),

  body("department")
  .trim()
  .notEmpty()
  .withMessage("Department is required"),

  body("year")
    .isInt({ min: 1, max: 5 })
    .withMessage("Year must be between 1 and 5"),
];

const loginValidation = [
  body("email")
  .trim()
  .isEmail()
  .withMessage("Please provide a valid email")
  .normalizeEmail(),

  body("password")
  .isLength({ min:6 })
  .withMessage("Password must be at least 6 characters long")
]

const forgotPasswordValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  handleValidationErrors,
};