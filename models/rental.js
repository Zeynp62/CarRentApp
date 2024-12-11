const mongoose = require('mongoose');

//References for user and car schemas
const User = require('./user');
const Car = require('./car');

const rentalSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
});

const Rental = mongoose.model('Rental', rentalSchema);
module.exports = Rental;
