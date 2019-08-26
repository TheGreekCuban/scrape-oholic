const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()


//const db = require("./models")

const PORT = process.env.PORT

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

//Set handlebars
const exphbs = require("express-handlebars")

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Import the routes and give the server access to them
const routes = require("./controllers/scraper_controller")

app.use(routes)

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrape-oholic"

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
})

// Start the server
app.listen(PORT, function () {
    console.log("App listening on http://localhost:" + PORT);
});