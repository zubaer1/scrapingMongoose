// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Article = require("./models/Article.js");
//var Note = require("./models/Note.js");
var request = require("request");
var cheerio = require("cheerio");
var app = express();

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Use body parser with our app
app.use(bodyParser.urlencoded({
          extended: false
        }));
app.use(express.static("public"));

// Set the view rendering middleware to use handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mongoConnect = process.env.MONGODB_URI || "mongodb://localhost/week18day3mongoose";
mongoose.connect(mongoConnect);
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes =============================================================

  app.get("/", function(request, response) {
    response.render("index");
  });


  // HTTP get request for end-point 'scrape'
  app.get("/scrape", function(req, res) {
    
    // Asynch request to the newspaper URL
    request("https://www.washingtonpost.com/", function(error, response, html) {
      
      // Using cheerio to create a virtual DOM and JQuey like selection of elements
      // inside that DOM
      var $ = cheerio.load(html);
     
      // This array will hold headlines captured from newspaper html
      var headlines = [];

      // Use cheerio to select HTML elements that are the headlines
      $("#main-content .headline").each( function(i, element) {

        headlines.push($(this).text());

      });

      // Send the headlines ( which is an array of strings ) back to the web client
      res.send(headlines);

      // Save the headlines inside of our mongo database using mongoose schema "Article"
      headlines.forEach( function (headline) {
  
        // Create a new mongoose "Article" schema oject and save the article in the mongo database
        var newArticle = new Article({ 
          title: headline,
          link: "none"
        });
       
        // Use mongoose method of the Article schema object to save each headline in the mongo database
        newArticle.save(function(err, doc) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(doc);
          }
        });
      
      });
    });
});


app.get("/articles", function(req, res) {
  Article.find({})
      .exec(function(err, articles) {
        if(err)
        {
          res.send('error present')
        }else
        res.send(articles);
        //res.json(articles);
        console.log(articles);
  });
});



app.listen(3000, function() {
  console.log("App running on port 3000!");
});
