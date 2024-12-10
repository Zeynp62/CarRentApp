const router = require('express').Router()
const Rental = require('../models/rental')
const Car = require('../models/car')
const isSignedIn = require('../middleware/is-signed-in')
const validateRental = require('../middleware/validate-rental')

// Show rental form
router.get('/rent/:carId', isSignedIn, async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId)
    if (!car || !car.availability) {
      return res.status(400).send('Car not available')
    }
    res.render('rentals/rent', { car })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

// Handle rental form submission
router.post('/rent/:carId', isSignedIn, validateRental, async (req, res) => {
  try {
    const { startDate, endDate } = req.body
    console.log('Received Form Data:', req.body) // Debugging statement
    const userId = req.session.user._id

    const car = await Car.findById(req.params.carId)
    if (!car || !car.availability) {
      return res.status(400).send('Car not available')
    }
    // Prevent renting own car
    if (String(car.user) === String(userId)) {
      return res.status(400).send('You cannot rent your own car.')
    }

    const rentalDays =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    const totalCost = car.price * rentalDays
    console.log('Calculated Rental Days:', rentalDays) // Debugging statement
    console.log('Calculated Total Cost:', totalCost) // Debugging statement

    const rental = new Rental({
      user: userId,
      car: req.params.carId,
      startDate: new Date(startDate), // Ensure correct date parsing
      endDate: new Date(endDate), // Ensure correct date parsing
      totalCost: totalCost
    })

    await rental.save()
    car.availability = false
    await car.save()

    res.redirect('/rentals')
  } catch (error) {
    console.error('Error creating rental:', error)
    res.status(500).send('Internal Server Error')
  }
})

// View current user's rentals
router.get('/', isSignedIn, async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.session.user._id }).populate(
      'car'
    )
    res.render('rentals/index', { rentals })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

// Cancel a rental
router.delete('/:id', isSignedIn, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('car')
    if (!rental) {
      return res.status(404).send('Rental not found')
    }

    if (!rental.user.equals(req.session.user._id)) {
      return res.status(403).send('Forbidden')
    }

    const car = await Car.findById(rental.car._id)
    car.availability = true
    await car.save()

    await Rental.findByIdAndDelete(req.params.id)
    res.redirect('/rentals')
  } catch (error) {
    console.error('Error cancelling rental:', error)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
