const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const crypto = require('crypto');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const bcrypt = require('bcryptjs');
const { getUserByEmail, urlsForUser } = require('./helper');
const PORT = 8080;

app.set('view engine', 'ejs');

// const urlDatabase = {
//   'b2xVn2': 'http://www.lighthouselabs.ca',
//   '9sm5xK': 'http://www.google.com'
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
  let templateVars = {};
  if (req.session.userID !== undefined) {
    templateVars = { urls: urlsForUser(req.session.userID, urlDatabase), users: users[req.session.userID] };
  }
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json({ ...urlDatabase, ...users });
});

app.get('/urls/new', (req, res) => {
  const templateVars = { urls: urlDatabase };
  if (req.session.userID !== undefined && users[req.session.userID] !== undefined) {
    templateVars['users'] = users[req.session.userID];
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:id', (req, res) => {
  if (req.session.userID !== undefined && users[req.session.userID] !== undefined) {
    if (urlDatabase[req.params.id].userID === req.session.userID) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
    }
  }
  res.redirect(`/urls`);
});

app.post('/urls', (req, res) => {
  console.log(urlDatabase);
  if (req.session.userID !== undefined && users[req.session.userID] !== undefined) {
    const urlDBKey = generateRandomString();
    urlDatabase[urlDBKey] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${urlDBKey}`);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.userID !== undefined && users[req.session.userID] !== undefined) {
    if (urlDatabase[req.params.shortURL].userID === req.session.userID) {
      console.log(`Deleted ${req.params.shortURL} : ${urlDatabase[req.params.shortURL]}`);
      delete urlDatabase[req.params.shortURL];
    }
  }
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  if (req.session.userID !== undefined && users[req.session.userID] !== undefined) {
    if (urlDatabase[req.params.shortURL].userID === req.session.userID) {
      const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email: users[req.session.userID].id };
      res.render('urls_show', templateVars);
    } else {
      res.redirect('/urls');
    }
  } else {
    res.redirect('/urls');
  }
});

app.get('/u/:shortURL', (req, res) => {
  console.log(req.params.shortURL);
  console.log(urlDatabase);
  if (urlDatabase[req.params.shortURL] !== undefined) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    if (!longURL.toLowerCase().includes("http://") && !longURL.toLowerCase().includes("https://")) {
      longURL = "http://" + longURL;
    }
    res.redirect(longURL);
  } else {
    res.status(404).render('url_not_found');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  if (req.body.email !== undefined && req.body.password !== undefined) {
    const doesUserExist = getUserByEmail(req.body.email, users);
    if (doesUserExist && doesUserExist.email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, doesUserExist.password)) {
        req.session.userID = doesUserExist.id;
        res.redirect(`/urls`);
      } else {
        res.status(403).send("username or password incorrect");
      }
    } else {
      res.status(403).send("username or password incorrect");
    }
  } else {
    res.status(403).send("username or password incorrect");
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  if (req.body.email !== undefined && req.body.password !== undefined) {
    if (getUserByEmail(req.body.email, users)) {
      res.status(400).send('Email already registered');
    } else {
      const randomID = generateRandomString();
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.userID = randomID;
      // console.log(users);
      res.redirect('/urls');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  return crypto.randomBytes(4).toString('hex');
};