const router = require('express').Router()
// const express = require('express')
//import model
const User = require('../models/user')
const Car = require('../models/car')
const isCarOwner = require('../middleware/is-car-owner')
const validateCar = require('../middleware/validate-car')
const upload = require('../middleware/upload')

router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().populate('user')
    console.log(cars)
    res.render('cars/index.ejs', { cars })
  } catch (error) {
    console.error(error)
  }
})

router.get('/new', async (req, res) => {
  res.render('cars/new.ejs')
})

router.post('/', upload, validateCar, async (req, res) => {
  try {
    req.body.user = req.session.user._id
    await Car.create(req.body)
    res.redirect('/cars')
  } catch (error) {
    console.error(error)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('user')
    if (!car) {
      res.send('There is no car available for rent')
    }
    res.render('cars/show', { car })
  } catch (error) {
    console.error(error)
  }
})

// View car details
router.get('/:carId', async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId).populate('user')
    if (!car) {
      return res.status(404).send('Car not found')
    }
    res.render('cars/show', { car })
  } catch (error) {
    console.error(error)
  }
})

// Get car for editing
router.get('/:carId/edit', isCarOwner, async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId)
    if (!car) {
      return res.status(404).send('Car not found')
    }
    res.render('cars/edit', { car })
  } catch (error) {
    console.error(error)
  }
})

router.put('/:carId', isCarOwner, upload, validateCar, async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.carId,
      {
        ...req.body,
        image: req.file ? req.file.filename : undefined // Update image if a new one is uploaded
      },
      {
        new: true, // Return the updated document
        runValidators: true // Ensure validation is applied
      }
    )

    if (!updatedCar) {
      return res.status(404).send('Car not found')
    }

    res.redirect(`/cars/${updatedCar._id}`)
  } catch (error) {
    console.error('Error updating car:', error)
    res.status(500).send('Internal Server Error')
  }
})

// router.put('/:carId', isCarOwner, upload, validateCar, async (req, res) => {
//   try {
//     const selectedCar = await Car.findById(req.params.carId)
//     if (selectedCar.user.equals(req.session.user._id)) {
//       await selectedCar.updateOne(req.body)
//       res.redirect(`/cars/${selectedCar._id}`)
//     } else {
//       res.send("You don't have permission to do that.")
//     }
//   } catch (error) {
//     console.error(error)
//   }
// })

// router.put('/:listingId', async (req, res) => {
//   try {
//     const currentListing = await Listing.findById(req.params.listingId)
//     if (currentListing.owner.equals(req.session.user._id)) {
//       await currentListing.updateOne(req.body)
//       res.redirect('/listings')
//     } else {
//       res.send("You don't have permission to do that.")
//     }
//   } catch (error) {
//     console.log(error)
//     res.redirect('/')
//   }
// })

// Delete car listing
router.delete('/:carId', isCarOwner, async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId)
    if (!car || !car.user.equals(req.session.user._id)) {
      res.send("You don't own this car")
    }
    await Car.findByIdAndDelete(req.params.carId)
    res.redirect('/cars')
  } catch (error) {
    console.error(error)
  }
})

// router.post('/', async (req, res) => {
//   req.body.owner = req.session.user._id
//   if (req.body.isAvailabile === 'on') {
//     req.body.isAvailabile = true
//   } else {
//     req.body.isAvailabile = false
//   }
//   await Car.create(req.body)
//   res.redirect('/cars')
// })

// router.get('/:carId', async (req, res) => {
//   try {
//     console.log('carId: ', req.params.carId)
//     res.send(`cars show page`)
//   } catch (error) {
//     console.log(error)
//     res.redirect('/')
//   }
// })

module.exports = router
