const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render('hello_world', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  if (req.cookies['user_id'] !== undefined) {
    templateVars['users'] = users[req.cookies['user_id']];
  }
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { urls: urlDatabase };
  if (req.cookies['user_id'] !== undefined) {
    templateVars['users'] = users[req.cookies['user_id']];
  }
  res.render('urls_new', templateVars);
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  const urlDBKey = generateRandomString();
  urlDatabase[urlDBKey] = req.body.longURL;
  console.log(generateRandomString());
  res.redirect(`/urls/${urlDBKey}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL] !== undefined) {
    console.log(`Deleted ${req.params.shortURL} : ${urlDatabase[req.params.shortURL]}`);
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls`);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], email: users[req.cookies['user_id']].id };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  if (req.body.email !== undefined && req.body.password !== undefined) {
    const doesUserExist = checkEmailExists(req.body.email);
    if (doesUserExist && doesUserExist.email === req.body.email) {
      if (doesUserExist.password === req.body.password) {
        res.cookie('user_id', doesUserExist.id);
        res.redirect(`/urls`);
      }
    }
  }
  res.status(403).send("username or password incorrect");
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  if (req.body.email !== undefined && req.body.password !== undefined) {
    if (checkEmailExists(req.body.email)) {
      res.status(400).send('Email already registered');
    } else {
      const randomID = `user${generateRandomString()}`;
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: req.body.password
      };
      res.cookie('user_id', randomID);
      // console.log(users);
      res.redirect(`/urls`);
    }
  }
});

const checkEmailExists = (email) => {
  for (const user of Object.values(users)) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  return crypto.randomBytes(3).toString('hex');
};