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
}

let uniqueEmailChecker = function(email) {
  for (let user in users) {
    console.log(users[user].email);
    if (users[user].email === email) {
      return false;
    }
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,  longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let newShortUrl =  generateRandomString();
  urlDatabase[newShortUrl] = `http://www.${req.body.longURL}`;
  res.redirect(`/urls/${newShortUrl}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = `http://www.${req.body.newURL}`;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("user_id");
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.cookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register_page");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let pw = req.body.password;
  if (email ===  "" || pw === "") {
    res.status(400).send('Email and password cannot be empty.');
    return;
  }
  else if (uniqueEmailChecker(email) === false) {
    res.status(400).send("Email address already registered.");
    return;
  }
  let newUserId = generateRandomString();
  users[newUserId] = { id: newUserId , email: email , password: pw }
  console.log(users);
  res.cookie("user_id", newUserId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});