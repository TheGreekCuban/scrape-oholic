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
    db.Scraper.find({saved: false})
        .then(dbScraper => {
            response.render("index", {articles: dbScraper})
        }).catch(error => {
            response.json(error)
        })
})

//We need a get route to get all the SAVED articles from the DB
router.get("/savedarticles", (request, response) => {
    //Find with no parameters grabs every document in the scraper collection
    db.Scraper.find({saved: true}).populate("note")
        .then(dbScraper => {
            console.log(dbScraper)
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

//Need a route to create a note at the specific article we click on!
router.post("/articles/note/:id", (request, response) => {
    console.log(request.body)
    db.Note.create(request.body).then(dbNote => {
        //If a note was created successfully, find one article with an id equal to request params.id and update the article associated with the new note.
        //{new: true} tells us the query that we want it to return the updated article, it returns the original one otherwise.
        //Since our mongoose query returns a promise, we can chain another .then which receives the result of the query
        return db.Scraper.findByIdAndUpdate(request.params.id, {$push: {note: dbNote._id}}, {new: true})
            .then(dbScraper => {
                response.send(dbScraper)
            }).catch(error => {
                response.json(error)
            })
    })
})


//Need a route for changing saved from false to true
router.post("/saved/:id", (request, response) => {

    return db.Scraper.findByIdAndUpdate(request.params.id, {saved: request.body.saved}, {new: true})
        .then(dbScraper => {
            console.log(dbScraper)
            response.json(dbScraper)
        }).catch(error => {
            response.json(error)
        })
})

//Need a route for changing saved from false to true aka deleting it from the saved page
router.put("/articles/delete/:id", (request, response) => {
console.log(request.params.id)
    return db.Note.deleteOne(request.params.id, (error => {
        response.json(error)
    }))
})


// Route for deleting the note
router.put("/articles/note/:id", (request, response) => {

    db.Note.findByIdAndRemove(request.params.id)
        .then(dbScraper => {
            response.send(dbScraper);
        })
        .catch(error => {
            response.json(error);
        });
});


//need this for the server
module.exports = router