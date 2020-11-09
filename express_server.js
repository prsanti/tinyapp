const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);

  // res.send("<html><body>Hello <b>World</b></body></html>\n");
});

 // Template Engine Excercise
 app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };

  // res.render takes in a .ejs file from views, then a variable to pass into the .ejs file
  res.render("urls_index", templateVars);
 });

 // Must be defined GET "/urls/:shortURL" because Express will think that new is a route parameter.
 app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

 app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});

// Scope problem
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});