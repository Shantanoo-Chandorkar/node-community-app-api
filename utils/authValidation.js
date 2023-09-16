`use strict`;
const passwordValidator = require("password-validator");

// Create a schema
const passwordSchema = new passwordValidator();

// Add properties to it
passwordSchema
  .is()
  .min(6, "Password should be at least 6 characters.") // Minimum length 6
  .is()
  .max(100) // Maximum length 100
  .has()
  .uppercase(1, "Password must have an uppercase letter.") // Must have uppercase letters
  .has()
  .lowercase(1, "Password must have a lowercase letter.") // Must have lowercase letters
  .has()
  .symbols(1, "Password must have a symbol.") // Must have at least 1 symbol
  .has()
  .digits(1, "Password must have a digit.") // Must have at least 1 digit
  .has()
  .not()
  .spaces(); // Should not have spaces

module.exports = passwordSchema;
