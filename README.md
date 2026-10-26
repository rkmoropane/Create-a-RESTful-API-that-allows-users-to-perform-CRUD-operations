# Create a RESTful API for Payment CRUD Operations

[![Cognitive Class](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBM-CC0100EN-SkillsNetwork/images/IDSN-logo.png)](https://cognitiveclass.ai/)

## Estimated Time

Approximately 30 minutes.

## Lab Overview

In this lab, you will build a RESTful API for tracking vendor payments. The API will connect to MongoDB and support CRUD operations:

- **Create** payment records.
- **Read** payment records.
- **Update** payment records.
- **Delete** payment records.

## Learning Objectives

After completing this lab, you will be able to:

- Create an Express server with payment-tracking API endpoints.
- Retrieve data stored in MongoDB through API endpoints.
- Add payment data through a POST endpoint.
- Update payment data through a PUT endpoint.
- Delete payment data through a DELETE endpoint.
- Test RESTful API endpoints using Postman.

---

## About Skills Network Cloud IDE

Skills Network Cloud IDE provides an environment for hands-on labs and course-related projects. Theia is an open-source Integrated Development Environment, also known as an IDE.

## Important Notice About the Lab Environment

The lab environment is temporary and does not persist between sessions. Every time you connect to the lab, a new environment is created.

Files, directories, and data saved during an earlier session may be deleted when you leave the lab environment. Complete the lab in a single session and save important work in your own repository.

---

# Exercise 1: Start MongoDB

Open the Skills Network Toolbox in the Cloud IDE.

![Skills Network Toolbox](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMSkillsNetwork-DB0151EN-edX/images/skills-network-toolbox.png)

MongoDB may initially appear as inactive, which means the database is not available.

![MongoDB shown as inactive](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMSkillsNetwork-DB0151EN-edX/images/inactive-mongodb.png)

Select MongoDB to view its details and start it.

![MongoDB start screen](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/0H2R2Gu5FuNmdtFHkraT8Q/mongo-inactive-new.png)

Select the start button. A background process will configure and start the MongoDB server.

![Starting MongoDB](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/pBxGMvTsMnWPFbK-RkDcFA/starting-mongodb-new.png)

When MongoDB is ready, open **Connection Information** and record the password.

MongoDB authentication is enabled, so you will need the password to log in as the `"root"` user.

![MongoDB connection information](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/F0HRMkbNYNm2GZK6uDVifw/mongo-connection-info.png)

Keep the following information available:

- Username: `"root"`
- Password: The password provided by the lab environment.
- Host: The host address provided by the lab environment.
- Port: Usually `"27017"`.

---

# Exercise 2: Connect to MongoDB from Node.js

## 1. Create the Project Directory

Open a new terminal and create the project directory:

```bash
"mkdir paymenttracker"
```

Move into the directory:

```bash
"cd paymenttracker"
```

## 2. Initialize the Node.js Application

Initialize the directory as a Node.js application:

```bash
"npm init"
```

Choose the appropriate values when prompted, or press **Enter** to accept the default values.

This creates a `"package.json"` file in the `"paymenttracker"` directory.

## 3. Install Dependencies

Install Mongoose for connecting to MongoDB:

```bash
"npm install mongoose@8.0.3"
```

Install Express for creating the API server:

```bash
"npm install express"
```

Install Body Parser for processing request data:

```bash
"npm install body-parser"
```

Install CORS for testing the API from external applications such as Postman:

```bash
"npm install cors"
```

---

# Exercise 3: Create the Vendor Payment Schema

## 1. Create the Models Directory and Schema File

Create a `"models"` directory and a `"vendorPayment.js"` file:

```bash
"mkdir models && touch models/vendorPayment.js"
```

## 2. Add the Mongoose Schema

Open `"models/vendorPayment.js"` and add the following code:

```javascript
"const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const VendorPaymentsSchema = new Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  vendor_id: {
    type: String,
    required: true
  },
  invoice_no: {
    type: Number,
    required: true
  },
  payment_duedate: {
    type: Date,
    default: new Date(),
    required: true
  },
  payment_date: {
    type: Date
  },
  amount: {
    type: Number,
    required: true
  },
  balance_amount: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VendorPayments', VendorPaymentsSchema);"
```

The `"timestamps: true"` option automatically adds:

- `"createdAt"`
- `"updatedAt"`

### Schema Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `"transaction_id"` | String | Yes | Unique payment transaction identifier. |
| `"vendor_id"` | String | Yes | Vendor identifier. |
| `"invoice_no"` | Number | Yes | Invoice number. |
| `"payment_duedate"` | Date | Yes | Payment due date. |
| `"payment_date"` | Date | No | Date on which payment was made. |
| `"amount"` | Number | Yes | Amount paid in the current transaction. |
| `"balance_amount"` | Number | Yes | Remaining amount owed. |
| `"payment_status"` | String | Yes | `"Unpaid"`, `"Partially Paid"`, or `"Fully Paid"`. |

---

# Exercise 4: Create the CRUD Routes

Separating routes from the main application improves readability, organization, and maintainability.

## 1. Create the Routes Directory

Create a directory named `"routes"`:

```bash
"mkdir routes"
```

Create the route file:

```bash
"touch routes/vendor_payment.js"
```

## 2. Add the CRUD Routes

Open `"routes/vendor_payment.js"` and add the following code:

```javascript
"const express = require('express');
const router = express.Router();
const VendorPayment = require('../models/vendorPayment');

// Create a new vendor payment.
router.post('/', async (req, res) => {
  try {
    const vendorPayment = new VendorPayment(req.body);
    const savedPayment = await vendorPayment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get all vendor payments.
router.get('/', async (req, res) => {
  try {
    const vendorPayments = await VendorPayment.find();
    res.json(vendorPayments);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get vendor payments by payment status.
router.get('/status/:payment_status', async (req, res) => {
  try {
    const vendorPayments = await VendorPayment.find({
      payment_status: req.params.payment_status
    });

    res.json(vendorPayments);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get vendor payments for a specific vendor.
router.get('/vendor/:vendor_id', async (req, res) => {
  try {
    const vendorPayments = await VendorPayment.find({
      vendor_id: req.params.vendor_id
    });

    res.json(vendorPayments);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Update a vendor payment for a transaction.
router.put('/:transaction_id', async (req, res) => {
  try {
    const transaction = await VendorPayment.findOne({
      transaction_id: req.params.transaction_id
    });

    if (!transaction) {
      return res.status(404).json({
        message: 'No such transaction found'
      });
    }

    const paymentAmount = Number(req.body.amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: 'A valid positive payment amount is required'
      });
    }

    transaction.balance_amount -= paymentAmount;

    if (transaction.balance_amount <= 0) {
      transaction.balance_amount = 0;
      transaction.payment_status = 'Fully Paid';
    } else {
      transaction.payment_status = 'Partially Paid';
    }

    transaction.payment_date = new Date();

    const savedPayment = await transaction.save();
    res.json(savedPayment);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Delete a vendor payment transaction.
router.delete('/:transaction_id', async (req, res) => {
  try {
    const deletedPayment = await VendorPayment.deleteOne({
      transaction_id: req.params.transaction_id
    });

    if (deletedPayment.deletedCount === 0) {
      return res.status(404).json({
        message: 'No such transaction found'
      });
    }

    res.json({
      message: 'Vendor payment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;"
```

## CRUD Route Summary

| Method | Route | Purpose |
|---|---|---|
| `"POST"` | `"/vendorPayments"` | Creates a vendor payment. |
| `"GET"` | `"/vendorPayments"` | Retrieves all vendor payments. |
| `"GET"` | `"/vendorPayments/status/Unpaid"` | Filters payments by status. |
| `"GET"` | `"/vendorPayments/vendor/V001"` | Retrieves payments for a vendor. |
| `"PUT"` | `"/vendorPayments/T001"` | Updates a payment transaction. |
| `"DELETE"` | `"/vendorPayments/T001"` | Deletes a payment transaction. |

### Important Route Design Note

The original lab uses both `"/:payment_status"` and `"/:vendor_id"`. These patterns are identical to Express and can conflict because Express cannot determine whether a value represents a status or a vendor ID.

This README uses explicit paths:

- `"/status/:payment_status"`
- `"/vendor/:vendor_id"`

This makes the routes unambiguous and also corrects the original route's missing `"req.params"` reference.

---

# Exercise 5: Create the Main Express Application

## 1. Create the Application File

Create `"payment_tracker.js"`:

```bash
"touch payment_tracker.js"
```

## 2. Add the Express Application Code

Open `"payment_tracker.js"` and add the following code.

Replace `"your_password"` with the password provided by the MongoDB instance.

```javascript
"const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const vendorPaymentsRouter = require('./routes/vendor_payment');

const app = express();
const port = 3000;

// Parse JSON request bodies.
app.use(bodyParser.json());

// Connect to MongoDB.
const uri = 'mongodb://root:your_password@localhost:27017';

mongoose.connect(uri, {
  dbName: 'transactionsDB'
});

// Use the vendor payment routes.
app.use('/vendorPayments', vendorPaymentsRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});"
```

## 3. Start the Application

Run the Node.js application:

```bash
"node payment_tracker.js"
```

The Express server starts on port `"3000"`.

---

# Exercise 6: Test the CRUD API with Postman

Open [Postman Web](https://web.postman.co/workspaces) and sign in using the account created for the earlier labs.

Open the workspace named `"Backend Node.js API Testing"`.

Use the **Launch Application** option in the Skills Network Toolbox to open the application running on port `"3000"`.

Copy the application URL from the browser and use it as the base URL in Postman.

For the examples below, the base endpoint is:

`"BASE_URL/vendorPayments"`

Replace `"BASE_URL"` with the URL assigned to your lab application.

## 1. Test the GET Endpoint

1. Create a new request in Postman.
2. Use the `"GET"` method.
3. Enter `"BASE_URL/vendorPayments"`.
4. Select **Send**.

Because no payment records have been created yet, the response should be an empty list:

```json
"[]"
```

## 2. Test the POST Endpoint

1. Create a new request.
2. Use the `"POST"` method.
3. Enter `"BASE_URL/vendorPayments"`.
4. Select **Body**.
5. Select **raw**.
6. Select **JSON**.
7. Add the following request body:

```json
"{
  \"transaction_id\": \"T001\",
  \"vendor_id\": \"V001\",
  \"invoice_no\": 1,
  \"amount\": 0.00,
  \"balance_amount\": 250.00,
  \"payment_status\": \"Unpaid\"
}"
```

8. Select **Send**.

The response should contain the newly created payment record.

Pay attention to:

- `"balance_amount"`: The amount still owed.
- `"payment_status"`: The current payment state.

## 3. Confirm the Payment Was Created

Return to the GET request and select **Send** again.

The response should contain the payment record with transaction ID `"T001"`.

## 4. Test the PUT Endpoint

Create a new request using:

- Method: `"PUT"`
- URL: `"BASE_URL/vendorPayments/T001"`

Select **Body > raw > JSON** and add:

```json
"{
  \"transaction_id\": \"T001\",
  \"vendor_id\": \"V001\",
  \"invoice_no\": 1,
  \"amount\": 250.00
}"
```

Select **Send**.

The original balance is `"250.00"`. The payment amount is also `"250.00"`, so the remaining balance becomes `"0"` and the payment status changes to:

`"Fully Paid"`

Return to the GET request and select **Send** to confirm that the payment record has been updated.

## 5. Test the DELETE Endpoint

Create a new request using:

- Method: `"DELETE"`
- URL: `"BASE_URL/vendorPayments/T001"`

Select **Send**.

The API should return a confirmation message:

```json
"{
  \"message\": \"Vendor payment deleted successfully\"
}"
```

Return to the GET request and select **Send** again. The deleted record should no longer appear.

## 6. Test Additional Queries

You can test payment status filtering:

`"GET BASE_URL/vendorPayments/status/Unpaid"`

You can test vendor filtering:

`"GET BASE_URL/vendorPayments/vendor/V001"`

Repeat the exercise with additional vendor payment records to become familiar with CRUD operations.

---

# CRUD Workflow Summary

| Operation | HTTP Method | Endpoint | Result |
|---|---|---|---|
| Create | `"POST"` | `"/vendorPayments"` | Adds a new payment record. |
| Read all | `"GET"` | `"/vendorPayments"` | Returns all payment records. |
| Filter by status | `"GET"` | `"/vendorPayments/status/Unpaid"` | Returns payments with a selected status. |
| Filter by vendor | `"GET"` | `"/vendorPayments/vendor/V001"` | Returns payments for a selected vendor. |
| Update | `"PUT"` | `"/vendorPayments/T001"` | Updates the balance and payment status. |
| Delete | `"DELETE"` | `"/vendorPayments/T001"` | Deletes a payment transaction. |

---

# Important Notes

- Replace `"your_password"` with the MongoDB password from **Connection Information**.
- Keep the terminal running `"node payment_tracker.js"` open while testing.
- The `"transaction_id"` field must be unique.
- Use valid values for `"payment_status"`: `"Unpaid"`, `"Partially Paid"`, or `"Fully Paid"`.
- The PUT operation reduces `"balance_amount"` by the payment amount.
- A balance less than or equal to zero is converted to `"0"` and marked `"Fully Paid"`.
- Use explicit route prefixes for payment status and vendor filtering to avoid route conflicts.
- The `"cors"` package is installed for external testing, but it must be enabled with `"app.use(cors())"` if browser-based cross-origin requests are required.

---

# Conclusion

Congratulations! You have connected a Node.js application to MongoDB and created a RESTful API for tracking vendor payments.

In this lab, you learned how to:

- Start and connect to MongoDB.
- Create a Mongoose schema.
- Organize Express routes in a separate file.
- Create payment records with POST.
- Retrieve payment records with GET.
- Filter records by status and vendor.
- Update payment balances with PUT.
- Delete payment transactions with DELETE.
- Test CRUD endpoints using Postman.

## Authors

- Lavanya T. S.

### Other Contributors

- Rama

© IBM Corporation. All rights reserved.
