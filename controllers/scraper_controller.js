const express = require("express")
const router = express.Router()
const db = require("../models")

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios")
const cheerio = require("cheerio")

//We need a get route for scraping the Rotoworld News
router.get("/scrape", function (request, response) {
    //First we grab the body of the html with axios
    axios.get("https://www.rotoworld.com/sports/nfl/football/").then(function(response) {
        //Then we load that into cheerio and save it to $ for the shorthand selector
        let $ = cheerio.load(response.data)
        console.log("headline list: ", $("ul.headline_list"))
        //Now, we grab every headline title tag and do the following
        $("ul.headline_list").each(function(i, element) {
            
            //Save an empty result object
            const result = {}

            //Add the text and href of every link, save them as properties of result
            result.title = $(element).find(".headline").find(".headline_title").text()
            result.link = $(element).find(".headline").find(".headline_title").find("a").attr("href")

            //Create a new Scraper using the result obj built from scraping
            db.Scraper.create(result).then((dbScraper => {
                console.log(dbScraper)
            })).catch(error => {
                console.log(error, "this is the error")
            })
            console.log("result: ", result)
        })
    })
    response.send("Scrape Complete!")
})

//need this for the server
module.exports = router