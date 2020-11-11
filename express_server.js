const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const e = require("express");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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

const generateRandomString = () => {
  // creates a random alpha-numeric string of 6 characters
  const shortURL = Math.random().toString(36).substring(2, 8);
  return shortURL;
};

const fetchEmail = (usersDatabase, email) => {
  for (const id in usersDatabase) {
    if (usersDatabase[id].email === email) {
      return true;
    }
  }
  return false;
};

// const fetchUser = (usersDatabase, id) => {
//   if (usersDatabase.id) {
//     return { error: null, user: usersDatabase[id] }
//   } else {
//     return { error: "User does not exist", user: null };
//   }
// };

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// /URLS Path
// Template Engine Excercise
app.get("/urls", (req, res) => {
  const templateVars = { 
    //username: req.cookies["username"], 
    user_id: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  // res.render takes in a .ejs file from views, then a variable to pass into the .ejs file
  // console.log(req.cookies);
  res.render("urls_index", templateVars);
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

// /urls/new Path
// Must be defined GET "/urls/:shortURL" because Express will think that new is a route parameter.
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    // username: req.cookies["username"]
    user_id: users[req.cookies["user_id"]],
    req
  };
  res.render("urls_new", templateVars);
});

// /u/:shortURL Path
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user_id: users[req.cookies["user_id"]],
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

// LOGIN
app.post("/login", (req, res) => {
  // res.cookie('username', req.body.username);
  res.cookie("user_id", users[req.cookies["user_id"]]);
  res.redirect("/urls");
});

// LOGOUT
app.post("/logout", (req, res) => {
  // res.clearCookie('username');
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// REGISTER
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    return res.status(400).send("Invalid email or password");
  } else if (fetchEmail(users, email)) {
    return res.status(400).send("Email already in use.");
  }

  // for (const id in users) {
  //   if (users[id].email === email) {
  //     // return res.send("Email already in use, please try again.");
  //     // console.log("email already in use, please try again.");
  //     // return res.redirect("/register");
  //     return res.status(400).send("Email already in use.");
  //   }
  // }

  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password
  };

  // cookie with the full object of id
  // res.cookie('user_id', users[id]);

  // cookie with just the id srting
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// old/working _header.ejs
// <% if (username) { %>
//   <form action="/logout" method="POST">
//     <label>Logged in As: <%= username %>!</label>
//     <input type="submit" value="Logout">
//   </form>
// <% } else { %>
// <form action="/login" method="POST">
//   <input name="username" type="text" placeholder="Username">
//   <input type="submit" value="Login">
// </form>
// <% } %>

// <% if (users[req.cookies["user_id"]]) { %>
//   <form action="/logout" method="POST">
//     <label>Logged in As: <%= users[req.cookies["user_id"]].email %>!</label>
//     <input type="submit" value="Logout">
//   </form>
// <% } else { %>
//   <form action="/login" method="POST">
//     <input name="username" type="text" placeholder="Username">
//     <input type="submit" value="Login">
// </form>
// <% } %>