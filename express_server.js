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

// Event when hitting submit under /urls/new
app.post("/urls", (req, res) => {
  let newID = generateRandomString();
  // adds the submited url into the urlDatabase with a random string ID
  urlDatabase[newID] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${newID}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

const generateRandomString = () => {
  // creates a random alpha-numeric string of 6 characters
  let id = Math.random().toString(36).substring(2, 8);
  return id;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});