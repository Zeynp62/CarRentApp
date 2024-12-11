const { body, validationResult } = require('express-validator');

const validateRental = 
[
  body('startDate').isDate().withMessage('Start date is required'),
  body('endDate').isDate().withMessage('End date is required').custom((value, { req }) =>
  {
    if (new Date(value) <= new Date(req.body.startDate))
    {
      throw new Error('End date must be after start date');
    }
    return true;
  }),
  (req, res, next) =>
  {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateRental;
