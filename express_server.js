const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// Import helper functions
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: ""},
  "9sm5xK": { longURL: "http://www.google.com", userID: ""}
};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Redirect home page to /urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// /URLS
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const userURL = urlsForUser(urlDatabase, userID);
  const templateVars = {
    user_id: users[req.session["user_id"]],
    urls: userURL
  };
  // res.render takes in a .ejs file from views, then a variable to pass into the .ejs file
  res.render("urls_index", templateVars);
});

// Event when hitting submit under /urls/new
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = users[req.session["user_id"]].id;

  // adds the submited url into the urlDatabase with a random string ID
  // adds 'http://' if the user did not when submitting a new url
  if (longURL.substring(0, 7) === "http://") {
    urlDatabase[shortURL] = {longURL: longURL, userID: userID };
  } else {
    urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: userID };
  }
  res.redirect(`/urls/${shortURL}`);
});

// /URLS/NEW
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: users[req.session["user_id"]],
  };
  const user = users[req.session["user_id"]];

  // If the user is logged in, take them to /urls/new path, else redirect them to the login page
  if (user) {
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

// /u/:shortURL Path
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user_id: users[req.session["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.send("URL not found.");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = users[req.session["user_id"]].id;

  if (userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

// EDIT
app.post("/urls/:shortURL/edit", (req, res) => {
  const longURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  let userID = null;

  if (req.session["user_id"]) {
    userID = users[req.session["user_id"]].id;
  } else {
    return res.redirect("/login");
  }

  // Checks if the current user logged in's ID matches the URL's ID of the user that created it
  if (userID === urlDatabase[shortURL].userID) {
    // checks if the user entered http:// or not for their input
    if (longURL.substring(0, 7) === "http://") {
      urlDatabase[shortURL] = { longURL: longURL, userID: userID };
    } else {
      urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: userID };
    }
    return res.redirect("/urls");
  }
  
  // redirects to login if a different user is trying to edit another user's URL
  return res.redirect("/login");
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  for (const user in users) {
    if (users[user].email === email) {
      // compares the entered password with the encrypted password in the user database
      if (bcrypt.compareSync(password, users[user].password)) {
        req.session["user_id"] = users[user].id;
        return res.redirect("/urls");
      } else {
        return res.status(403).send("Incorrect password.");
      }
    }
  }
  return res.status(403).send("Email not found");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user_id: users[req.session["user_id"]]
  };
  res.render("login", templateVars);
});

// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// REGISTER
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: users[req.session["user_id"]]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Invalid email or password");
  } else if (getUserByEmail(users, email)) {
    return res.status(400).send("Email already in use.");
  }

  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password: hashedPassword
  };

  req.session["user_id"] = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});