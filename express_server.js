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
  const userId = req.session["user_id"];
  // Redirects the user to /urls if logged in, otherwise redirects to /login
  if (userId) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

// /URLS
app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const userURL = urlsForUser(urlDatabase, userId);
  const templateVars = {
    user_id: users[userId],
    urls: userURL
  };
  // If user is logged in take them to /urls page, otherwise sends an error message to login.
  if (userId) {
    return res.render("urls_index", templateVars);
  } else {
    return res.status(400).send("Please login to view URLs.");
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.session["user_id"];
  // adds the submited url into the urlDatabase with a random string ID
  // adds 'http://' if the user did not when submitting a new url
  if (longURL.substring(0, 7) === "http://") {
    urlDatabase[shortURL] = {longURL: longURL, userID: userId };
  } else {
    urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: userId };
  }
  res.redirect(`/urls/${shortURL}`);
});

// /URLS/NEW
app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user_id: users[userId],
  };
  // If the user is logged in, take them to /urls/new path, else redirect them to the login page
  if (userId) {
    return res.render("urls_new", templateVars);
  }
  // Redirects user to /login if the user is not logged in
  return res.redirect("/login");
});

// /u/:shortURL Path
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  const shortURL = req.params.shortURL;
  // Checks if the URL is in the URL database before rendering /u/:shortURL
  // If it is not, send an error 404.
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found.");
  }

  // Checks if the current user is the same as the creator of the shortURL
  if (userId !== urlDatabase[shortURL].userID) {
    return res.status(403).send("Access forbidden. Please login with the correct account to view this page.")
  }

  // Adds variables to template vars to render the page after it checks for errors.
  const templateVars = {
    user_id: users[userId],
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"];
  // Checks if the same user created the URL before deleting it
  if (userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
  return res.status(400).send("Please login to delete the URL.");
});

// EDIT
app.post("/urls/:shortURL/edit", (req, res) => {
  const longURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  let userId = null;

  // Checks if the user is logged in before they can edit.
  if (req.session["user_id"]) {
    userId = users[req.session["user_id"]].id;
  } else {
    return res.redirect("/login");
  }

  // Checks if the current user logged in's ID matches the URL's ID of the user that created it
  if (userId === urlDatabase[shortURL].userID) {
    // checks if the user entered http:// or not for their input
    if (longURL.substring(0, 7) === "http://") {
      urlDatabase[shortURL] = { longURL: longURL, userID: userId };
    } else {
      urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: userId };
    }
    return res.redirect("/urls");
  }
  
  // redirects to login if a different user is trying to edit another user's URL
  return res.status(400).send("Please login to edit URL.");
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

  // Checks if the submitted email and password were empty and sends an error
  // if the email is already in use, send an error.
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