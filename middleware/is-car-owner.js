const Car = require('../models/car')

const isCarOwner = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.carId)
    if (car && car.user.equals(req.session.user._id)) {
      return next()
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports = isCarOwner
