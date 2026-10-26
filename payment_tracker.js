// dotenv for environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const vendorPaymentsRouter = require('./routes/vendor_payment');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// get all the values for environment variables
const {
    MONGODB_USER,
    MONGODB_PASSWORD,
    MONGODB_HOST,
    MONGODB_DATABASE,
    MONGODB_PORT,
    SECRET_KEY,
  } = process.env;
const secretKey = SECRET_KEY; // Replace with your own secret key


const uri =
`mongodb://${encodeURIComponent(MONGODB_USER)}:` +
`${encodeURIComponent(MONGODB_PASSWORD)}@` +
`${MONGODB_HOST}:${MONGODB_PORT}`;



// Connect to MongoDB
mongoose.connect(uri,{'dbName':`${MONGODB_DATABASE}`});
// const uri =  "mongodb://root:your_password@localhost:27017";


// Use Vendor Payments routes
app.use('/vendorPayments', vendorPaymentsRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
