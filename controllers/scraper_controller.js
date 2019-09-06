const express = require("express")
const router = express.Router()
const db = require("../models")

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios")
const cheerio = require("cheerio")

//HTML ROUTES BELOW:

//We need route for the home page
router.get("/", (request, response) => response.render("index"))

//We need a route to render the saved articles page
router.get("articles", (request, response) => res.render("articles"));


//API ROUTES BELOW:

//We need a get route for scraping the TheRealDeal News
router.get("/scrape", (request, response) => {

    //First we grab the body of the html with axios
    axios.get("https://therealdeal.com/").then(response => {
        //Then we load that into cheerio and save it to $ for the shorthand selector
        let $ = cheerio.load(response.data)
        let grabbedElement = $(".trd-article-lists-content").find("a")
        let removedItem = $(".trd-article-lists-content").find("a").find(".sponsored").find(".next")
        removedItem.remove()

        //Now, we grab every headline title tag and do the following
        $(grabbedElement).each((i, element) => {

            //Save an empty result object
            const result = {}

            //Add the text and href of every link, save them as properties of result
            result.title = $(element).find(".trd-article-body").find(".trd-article-title").text()
            result.link = $(element).attr("href")
            result.description = $(element).find(".trd-article-body").find(".trd-article-excerpt").text()
            result.meta = $(element).find(".trd-article-body").find(".trd-article-meta").text()
            
            //Create a new Scraper using the result obj built from scraping. First we search for a match by using findOne, if there is no match in the database then we create a new collection.
            db.Scraper.findOne({title: result.title}, (error, existingArticle) => {
                if (existingArticle === null) {
                    db.Scraper.create(result).then(dbScraper => {
                        console.log(`DB: ${dbScraper}`)
                    }).catch(error => {
                        console.log(`No duplicate entries allowed!`)
                    })
                }
            })
        })
    })
    response.send("Scrape Complete!")
})

//We need a get route to get all the articles from the DB
router.get("/showscraped", (request, response) => {
    //Find with no parameters grabs every document in the scraper collection
    db.Scraper.find({})
        .then(dbScraper => {
            response.render("index", {articles: dbScraper})
        }).catch(error => {
            response.json(error)
        })
})

//We need a get route to get all the SAVED articles from the DB
router.get("/savedarticles", (request, response) => {
    //Find with no parameters grabs every document in the scraper collection
    db.Scraper.find({}).populate("note")
        .then(dbScraper => {
            response.render("articles", {articles: dbScraper})
        }).catch(error => {
            response.json(error)
        })
})

//We need a route to get a specific article by ID and populate it with its note
router.get("/articles/:id", (request, response) => {
    //Using hte id passed in the id param, prepare a query that matches the posted id
    db.Scraper.findOne({
            id: request.params.id
        })
        //..then we populate all of the notes associated with it note matches the key on the scraper schema
        .populate("note").then(dbScraper => {
            response.send(dbScraper)
        })
        .catch(error => {
            response.json(error)
        })
})

router.post("/articles/:id", (request, respnse) => {
    db.Note.create(request.body).then(dbNote => {

        //If a note was created successfully, find one article with an id equal to request params.id and update the article associated with the new note.
        //{new: true} tells us the query that we want it to return the updated article, it returns the original one otherwise.
        //Since our mongoose query returns a promise, we can chain another .then which receives the result of the query
        return db.Scraper.findOneAndUpdate({
                id: request.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            })
            .then(dbScraper => {
                respnse.json(dbScraper)
            }).catch(error => {
                response.json(error)
            })
    })
})

// Route for deleting the note
router.put("/articles/note/:id", (request, response) => {

    db.Note.remove({
            _id: request.params.id
        })
        .then(dbScraper => {
            response.json(dbScraper);
        })
        .catch(error => {
            response.json(error);
        });
});


//need this for the server
module.exports = router