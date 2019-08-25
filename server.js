const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios")
const cheerio = require("cheerio")

// Require all models
//const db = require("./models")

const PORT = process.env.PORT || 3030

// Initialize Express
const app = express()

// Configure middleware
// Parse request body as JSON
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

// Make public a static folder
app.use(express.static("public"))

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrape-oholic"

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
})

// Start the server
app.listen(PORT, function () {
    console.log("App listening on http://localhost:" + PORT);
});