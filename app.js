var express = require("express"),
  methodOverride = require("method-override"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  expressSanitizer = require("express-sanitizer");

/*mongoose.connect("mongodb://localhost/restfulblog", {
  useUnifiedTopology: true, //important
  useNewUrlParser: true, //important
  useFindAndModify: false,
});*/
require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_URI;
/*const client = new MongoClient(uri, {
  useUnifiedTopology: true, //important
  useNewUrlParser: true, //important
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});*/

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

//app config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//mongoose config
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now },
});

var Blog = mongoose.model("Blog", blogSchema);

/*Blog.create({
  title: "test",
  image: "sample image",
  body: "yo dawg!",
});*/

//restful routes
app.get("/", function (req, res) {
  res.redirect("/blogs");
});

//index route
app.get("/blogs", function (req, res) {
  Blog.find({}, function (err, blogs) {
    if (err) {
      console.log("ERROR!");
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});

//new route
app.get("/blogs/new", function (req, res) {
  res.render("new");
});

//create route
app.post("/blogs", function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  console.log("===========");
  console.log(req.body);
  Blog.create(req.body.blog, function (err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
});

//show route
app.get("/blogs/:id", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});

//edit route
app.get("/blogs/:id/edit", function (req, res) {
  //req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});

//update route
app.put("/blogs/:id", function (req, res) {
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//delete route
app.delete("/blogs/:id", function (req, res) {
  Blog.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.listen(2000, function () {
  console.log("server running!");
});
