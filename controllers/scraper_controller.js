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
    axios.get("https://therealdeal.com/").then(function(response) {
        //Then we load that into cheerio and save it to $ for the shorthand selector
        let $ = cheerio.load(response.data)
        let grabbedElement = $(".trd-article-lists-content").find("a")
        let removedItem = $(".trd-article-lists-content").find("a").find(".sponsored").find(".next")
        removedItem.remove()
        
        //Now, we grab every headline title tag and do the following
        $(grabbedElement).each(function(i, element) {
            
            //Save an empty result object
            const result = {}

            //Add the text and href of every link, save them as properties of result
            result.title = $(element).find(".trd-article-body").find(".trd-article-title").text()
            result.link = $(element).attr("href")
            result.description = $(element).find(".trd-article-body").find(".trd-article-excerpt").text()
            result.meta = $(element).find(".trd-article-body").find(".trd-article-meta").text()
            //Create a new Scraper using the result obj built from scraping

            db.Scraper.findOne({title: result.title}, (error, existingArticle) => {
              if(existingArticle === null) {
                db.Scraper.create(result).then((dbScraper => {
                  console.log("Db Scraper: ", dbScraper)
                })).catch(error => {
                    console.log(`No duplicate entries allowed!`)
                })
              }
            })
        })
    })
    response.send("Scrape Complete!")
})

router.get("/articles", (request, response) => {
    db.Scraper.find({})
    .then(dbScraper => {
        response.json(dbScraper)
    }).catch(error => {
        response.json(error)
    })
})


//need this for the server
module.exports = router