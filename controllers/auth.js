//invoking router functionality with express
const router = require('express').Router()
const bcrypt = require('bcrypt')
const isSignedIn = require('../middleware/is-signed-in')
const upload = require('../middleware/upload')
const User = require('../models/user')
const isSignedIn = require('../middleware/is-signed-in')
//routes/API's/ Controller Functions
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})
router.post('/sign-up', upload, async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (userInDatabase) {
      return res.send('Username already taken')
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.send('password and confirm password must match ')
    }

    //bcrypt for password encryption
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword
    const user = await User.create(req.body)
    res.send(`THANKS FOR SIGNING UP ${user.username}`)
  } catch (error) {
    console.log(error)
  }
})
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})
router.post('/sign-in', async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username })
  if (!userInDatabase) {
    return res.send('Login failed try again')
  }
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  )
  if (!validPassword) {
    return res.send('Login failed try again')
  }

  //user exists and password is valid
  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  }
  res.redirect('/')
})
router.get('/sign-out', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})


router.get('/profile', async (req, res) => {
  try {
    const userId = req.session.user._id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).send('User not found')
    }

    res.render('auth/profile', { user })
  } catch (error) {
    console.log(error)
    res.status(500).send('An error occurred')
  }
})

// POST Profile (Update Profile)
router.post('/profile', async (req, res) => {
  try {
    const userId = req.session.user._id
    const { username, email, phone } = req.body

    
    await User.findByIdAndUpdate(userId, { username, email, phone }, { new: true })

    
    res.redirect('/auth/profile')
  } catch (error) {
    console.log(error)
    res.status(500).send('An error occurred while updating the profile')
  }
})



module.exports = router
