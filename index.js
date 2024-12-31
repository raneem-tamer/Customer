const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables from the .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse URL-encoded and JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL connection pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,     // Azure MySQL server hostname (cutomer-server.mysql.database.azure.com)
  user: process.env.DB_USER,     // Azure MySQL user (abekyzknpi@cutomer-server)
  password: process.env.DB_PASSWORD,  // Azure MySQL password (ZWu7FkC$dMQ5S9Kd)
  database: process.env.DB_NAME,  // Database name (cutomer-database)
  port: process.env.DB_PORT      // Database port (3306)
});

// Serve feedback form on homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Customer Feedback</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          flex-direction: column;
        }

        .feedback-form-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          width: 400px;
          max-width: 100%;
          margin-bottom: 30px;
        }

        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
        }

        label {
          font-size: 1.1em;
          color: #333;
          margin-bottom: 5px;
          display: block;
        }

        input[type="text"], textarea {
          width: 100%;
          padding: 12px;
          margin: 8px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 1em;
        }

        input[type="submit"] {
          background-color: #4CAF50;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
          width: 100%;
        }

        input[type="submit"]:hover {
          background-color: #45a049;
        }

        .message {
          background-color: #4CAF50;
          color: white;
          font-size: 2em;
          font-weight: bold;
          padding: 30px;
          border-radius: 8px;
          text-align: center;
          width: 60%;
          max-width: 600px;
          margin-top: 20px;
          opacity: 0;
          animation: fadeIn 3s ease-in-out forwards;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .form-footer {
          text-align: center;
          margin-top: 20px;
          color: #555;
        }

        .form-footer a {
          color: #4CAF50;
          text-decoration: none;
        }

        .form-footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>

      <div class="feedback-form-container">
        <h1>Customer Feedback</h1>
        <form action="/submit" method="POST">
          <label for="name">Your Name:</label>
          <input type="text" id="name" name="name" required>

          <label for="feedback">Your Feedback:</label>
          <textarea id="feedback" name="feedback" rows="5" required></textarea>

          <input type="submit" value="Submit Feedback">
        </form>

        <div class="form-footer">
          <p><a href="/">Go back to the homepage</a></p>
        </div>
      </div>

      <!-- Thank You Message -->
      <div class="message" id="thank-you-message">
        <p>Thank you for your feedback!</p>
      </div>

    </body>
    </html>
  `);
});

// Handle feedback form submission
app.post('/submit', (req, res) => {
  const { name, feedback } = req.body;

  // Insert feedback into MySQL database
  pool.query('INSERT INTO customer.feedback (name, feedback) VALUES (?, ?)', [name, feedback], (err, results) => {
    if (err) {
      console.error('Error inserting data: ', err);
      return res.status(500).send('Error saving feedback');
    }
    
    // After successful feedback submission, render a thank-you message
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Customer Feedback</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
          }

          .message {
            background-color: #4CAF50;
            color: white;
            font-size: 2em;
            font-weight: bold;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            width: 60%;
            max-width: 600px;
            margin-top: 20px;
            opacity: 0;
            animation: fadeIn 3s ease-in-out forwards;
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }

          .form-footer {
            text-align: center;
            margin-top: 20px;
            color: #555;
          }

          .form-footer a {
            color: #4CAF50;
            text-decoration: none;
          }

          .form-footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>

        <!-- Thank You Message -->
        <div class="message" id="thank-you-message">
          <p>Thank you for your feedback!</p>
        </div>

        <div class="form-footer">
          <p><a href="/">Go back to the homepage</a></p>
        </div>

      </body>
      </html>
    `);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
