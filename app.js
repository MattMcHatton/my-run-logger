require("dotenv").config();
require("./config/database").connect();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const auth = require("./middleware/auth");
const app = express();

app.use(express.json());

const User = require("./model/user");
const History = require("./model/history");

// Register
app.post("/register", async (req, res) => {

  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exists in database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }

});

// Login
app.post("/login", async (req, res) => {
  
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      res.status(200).json(user);
    } else {
      // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    } else {
      res.status(400).send("Invalid Credentials");
    }
    }
  } catch (err) {
    console.log(err);
  }
});

//Record run
app.post("/record", auth, async (req, res) => {
  
  try {
    // Get user input
    const { email, date, mileage, duration } = req.body;

    // Validate user input

    // Create history record in database
    const history = await History.create({
      email,
      date,
      mileage,
      duration,
    });

    res.status(201).json(history);
  } catch (err) {
    console.log(err);
  }
})

//Get runs
app.get("/record", auth, async (req, res) => {
  
  try {

    const qEmail = req.query.email;
    const records = await History.find({email: qEmail})
    res.status(200).json(records);

  } catch (err) {
    console.log(err);
  }
})

module.exports = app;


