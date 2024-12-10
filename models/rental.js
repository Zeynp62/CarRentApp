const mongoose = require('mongoose')

// Reference to User and Car schemas
const User = require('./user')
const Car = require('./car')

const rentalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: 'User', // This tells mongoose to refer to the User collection
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Car model
    ref: 'Car', // This tells mongoose to refer to the Car collection
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  }
})

const Rental = mongoose.model('Rental', rentalSchema)
module.exports = Rental
