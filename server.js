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


  app.get("/scrape", function(req, res) {
  request("www.nytimes.com", function(error, response, html) {
    var $ = cheerio.load(html);
    $("body #shell #mini-navigation ul").each(function(i, element) {
      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      var entry = new Article(result);
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });
    });
  });
  // Tell the browser that we finished scraping the text
 // res.send("Scrape Complete");
});


app.get("/articles", function(req, res) {
  Article.find({})
      .exec(function(err, articles) {
        if(err)
        {
          res.send('error present')
        }else
        res.send(articles);
        res.json(articles);
        console.log(articles);
  });
});



app.listen(3000, function() {
  console.log("App running on port 3000!");
});
