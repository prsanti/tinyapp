const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

// Template Engine Excercise
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"], 
    urls: urlDatabase
  };
  // res.render takes in a .ejs file from views, then a variable to pass into the .ejs file
  res.render("urls_index", templateVars);
});

// Must be defined GET "/urls/:shortURL" because Express will think that new is a route parameter.
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.send("URL not found.");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Event when hitting submit under /urls/new
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  // adds the submited url into the urlDatabase with a random string ID
  // checks before if http:// was added or not
  if (longURL.substring(0, 7) === "http://") {
    urlDatabase[shortURL] = longURL;
  } else {
    urlDatabase[shortURL] = `http://${longURL}`;
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

app.post("/urls/:shortURL/edit", (req, res) => {
  // console.log(req.body.newURL);
  // Input field named "newURL" is found in req.body
  const longURL = req.body.newURL;
  const shortURL = req.params.shortURL;

  // checks if the user entered http:// or not for their input
  if (longURL.substring(0, 7) === "http://") {
    urlDatabase[shortURL] = longURL;
  } else {
    urlDatabase[shortURL] = `http://${longURL}`;
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

const generateRandomString = () => {
  // creates a random alpha-numeric string of 6 characters
  const shortURL = Math.random().toString(36).substring(2, 8);
  return shortURL;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});