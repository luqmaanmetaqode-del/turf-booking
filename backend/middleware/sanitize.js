const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Sanitize user input to prevent NoSQL injection
const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  Sanitized input detected: ${key}`);
  }
});

// Prevent XSS attacks
const preventXSS = xss();

module.exports = {
  sanitizeInput,
  preventXSS
};
