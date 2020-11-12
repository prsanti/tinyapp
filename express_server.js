const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
// idk where this came from
// const e = require("express");

app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
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

// const authenticateUser = (usersDatabase, email, password) => {
//   for (const user in usersDatabase) {
//     if (usersDatabase.user.email === email) {
//       if (usersDatabase.user.password === password) {
//         return {error: null, user: usersDatabase[user]};
//       } else {
//         return { error: "Password does not match", user: null };
//       }
//     }
//   }
//   return {error: "Email not found", user: null };
// };

const urlsForUser = (id) => {
  let usersUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      usersUrls[url] = { longURL: urlDatabase[url].longURL, userID: id }
    }
    // usersShortenedUrls[url] = { longURL: urlDatabase[url].longURL, userID: userID};
  }
  return usersUrls;
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

  const userID = req.cookies["user_id"];
  // console.log(userID);

  // console.log(req.cookies["user_id"]);
  const userURL = urlsForUser(userID);
  // console.log(urlsForUser(userID));

  const templateVars = { 
    //username: req.cookies["username"], 
    user_id: users[req.cookies["user_id"]],
    // urls: urlDatabase
    urls: userURL
  };
  // console.log(templateVars);
  // console.log(user_id);
  // res.render takes in a .ejs file from views, then a variable to pass into the .ejs file
  // console.log(req.cookies);
  res.render("urls_index", templateVars);
});

// Event when hitting submit under /urls/new
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = users[req.cookies["user_id"]].id;
  console.log(userID);

  // adds the submited url into the urlDatabase with a random string ID
  // checks before if http:// was added or not
  // OLD
  // if (longURL.substring(0, 7) === "http://") {
  //   urlDatabase[shortURL] = longURL;
  // } else {
  //   urlDatabase[shortURL] = `http://${longURL}`;
  // }
  // NEW
  if (longURL.substring(0, 7) === "http://") {
    urlDatabase[shortURL] = {longURL: longURL, userID: userID }
  } else {
    urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: userID }
  }
  res.redirect(`/urls/${shortURL}`);
});

// /urls/new Path
// Must be defined GET "/urls/:shortURL" because Express will think that new is a route parameter.
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    // username: req.cookies["username"]
    user_id: users[req.cookies["user_id"]],
  };
  const user = users[req.cookies["user_id"]];

  // If the user is logged in, take them to /urls/new path, else redirect them to the login page
  if (user) {
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

// /u/:shortURL Path
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user_id: users[req.cookies["user_id"]],
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
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log("Delete post ------");
  // console.log("req.params: ", req.params);
  // console.log("req.body[userID].userID: ", req.params[userID].userID);
  const userID = users[req.cookies["user_id"]].id;
  // console.log("userID: ", userID);

  if (userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls")
  }
  return res.redirect("/login");
});

// EDIT
app.post("/urls/:shortURL/edit", (req, res) => {
  // console.log(req.body.newURL);
  // Input field named "newURL" is found in req.body
  // console.log("URLS EDIT ----")
  // console.log("req.body: ", req.body);
  const longURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  let userID = null;

  // console.log("req.cookies: ", req.cookies);
  if (req.cookies["user_id"]) {
    userID = users[req.cookies["user_id"]].id;
  } else {
    return res.redirect("/login");
  }

  // Checks if the current user logged in's ID matches the URL's ID of the user that created it
  if (userID === urlDatabase[shortURL].userID) {
     // checks if the user entered http:// or not for their input
    if (longURL.substring(0, 7) === "http://") {
      urlDatabase[shortURL] = { longURL: longURL, userID: userID }
    } else {
      urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: userID }
    }
    return res.redirect("/urls");
  }
  
  // redirects to login if a different user is trying to edit another user's URL
  return res.redirect("/login");
});

// LOGIN
app.post("/login", (req, res) => {
  // console.log(req.cookies);
  
  // idk which one to use. req.cookies is undefined
  // res.cookie("user_id", users[req.cookies["user_id"]]);
  // res.cookie("user_id", req.body.email);

  const { email, password } = req.body;
  //console.log(bcrypt.compareSync(password, ));
  // Old
  // for (const user in users) {
  //   if (users[user].email === email) {
  //     if (users[user].password === password) {
  //       res.cookie("user_id", users[user].id);
  //       return res.redirect("/urls");
  //     } else {
  //       return res.status(403).send("Incorrect password.");
  //     }
  //   }
  // }

  for (const user in users) {
    if (users[user].email === email) {
      // compares the entered password with the encrypted password in the user database
      if (bcrypt.compareSync(password, users[user].password)) {
        res.cookie("user_id", users[user].id);
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
    user_id: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});

// LOGOUT
app.post("/logout", (req, res) => {
  // res.clearCookie('username');
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// REGISTER
app.get("/register", (req, res) => {
  const templateVars = { 
    user_id: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // console.log(req.params);
  const hashedPassword = bcrypt.hashSync(password, 10);
  // console.log("hashed: ", hashedPassword, "plaintext: ", password);

  if (!email || !password) {
    return res.status(400).send("Invalid email or password");
  } else if (fetchEmail(users, email)) {
    return res.status(400).send("Email already in use.");
  }

  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  // test if the user database is added with a hashed password
  // console.log(users);

  // cookie with just the id srting
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});