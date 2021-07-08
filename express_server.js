const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let generateRandomString = function() {
  const alphaNumChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newString = "";
  for (let i = 0; i < 6; i++) {
    newString += alphaNumChars.charAt(Math.floor(Math.random() * alphaNumChars.length));
  }
  return newString;
};

let uniqueEmailChecker = function(email) {
  for (let user in users) {
    console.log(users[user].email);
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
};

let urlsForUser = function(id) {
  let myURLs = {}
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) 
      myURLs[url] = { longURL: urlDatabase[url].longURL, userID: id }
  }
  return myURLs;
};

const urlDatabase = {};
const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.cookie("user_id");
  }
  const templateVars = { urls: urlsForUser(req.cookies["user_id"]), user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  console.log(templateVars.user);
  if (templateVars.user === undefined) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(403).send("Shortened URL does not exist");
    return;
  }
  const templateVars = { shortURL: req.params.shortURL,  longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]]  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"] !== undefined) {
    let newShortUrl =  generateRandomString();
    urlDatabase[newShortUrl] = {longURL: `http://www.${req.body.longURL}`, userID: req.cookies["user_id"]};
    res.redirect(`/urls/${newShortUrl}`);
    return;
  }
  res.status(403).send("You may not create a new URL unless you are logged in.\n");
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = urlDatabase[req.params.shortURL]
  if (shortURL !== undefined) {
    let longURL = shortURL.longURL;
    res.redirect(longURL);
    return;
  }
  res.status(403).send("This is not a valid shortened link.");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
  res.status(403).send("You may not edit or delete URLS that aren't associated with your own userID.");
});

app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies["user_id"]) {
    urlDatabase[req.params.shortURL].longURL = `http://www.${req.body.newURL}`;
    res.redirect("/urls");
  }
  res.status(403).send("You may not edit or delete URLS that aren't associated with your own userID.");
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"] !== "undefined") {
    res.redirect("/urls");
    return;
  } 
  res.render("login_page");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let pw = req.body.password;
  let user = uniqueEmailChecker(email);
  if (user === false) {
    res.status(403).send("Email address not found.");
    return;
  } else {
    if (users[user].password !== pw) {
      res.status(403).send("Incorrect password.");
      return;
    } else {
      res.cookie("user_id", users[user].id);
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  res.cookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"] !== "undefined") {
    res.redirect("/urls");
    return;
  } 
  res.render("register_page");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let pw = req.body.password;
  if (email ===  "" || pw === "") {
    res.status(400).send('Email and password cannot be empty.');
    return;
  }
  else if (uniqueEmailChecker(email)) {
    res.status(400).send("Email address already registered.");
    return;
  }
  let newUserId = generateRandomString();
  users[newUserId] = { id: newUserId , email: email , password: pw };
  res.cookie("user_id", newUserId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});