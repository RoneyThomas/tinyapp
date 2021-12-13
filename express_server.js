const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');


const { getUserByEmail, urlsForUser, validUser, generateRandomString, getDateTime } = require('./helper');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

const PORT = 8080;

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW'
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW'
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

const analytics = {
  urlsVisitCount: {},
  urlsUniqiueVisitCount: {}
};

app.get('/', (req, res) => {
  if (validUser(req, users)) {
    res.redirect('/urls/');
  } else {
    res.redirect('/login');
  }
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
  res.json({ ...urlDatabase, ...users, ...analytics });
});

app.get('/urls/new', (req, res) => {
  const templateVars = { urls: urlDatabase };
  if (validUser(req, users)) {
    templateVars.users = users[req.session.userID];
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.put('/urls/:id', (req, res) => {
  if (validUser(req, users)) {
    if (urlDatabase[req.params.id] !== undefined && urlDatabase[req.params.id].userID === req.session.userID) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
      res.redirect(`/urls`);
    } else {
      // user is logged it but does not own the URL with the given ID
      const errorMessage = {
        users: users[req.session.userID],
        heading: `No URL found for ${users[req.session.userID].email}`
      };
      res.render('error', errorMessage);
    }
  } else {
    // user is not logged in
    const errorMessage = {
      heading: 'Not Logged In'
    };
    res.render('error', errorMessage);
  }
});

app.post('/urls', (req, res) => {
  if (validUser(req, users)) {
    const urlDBKey = generateRandomString();
    urlDatabase[urlDBKey] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    analytics.urlsVisitCount[urlDBKey] = [];
    analytics.urlsUniqiueVisitCount[urlDBKey] = [];
    res.redirect(`/urls/${urlDBKey}`);
  } else {
    // If the user is not logged in
    res.redirect('/login');
  }
});

app.delete('/urls/:shortURL', (req, res) => {
  if (validUser(req, users)) {
    if (urlDatabase[req.params.shortURL].userID === req.session.userID) {
      delete urlDatabase[req.params.shortURL];
      delete analytics.urlsVisitCount[req.params.shortURL];
      delete analytics.urlsUniqiueVisitCount[req.params.shortURL];
      res.redirect('/urls');
    } else {
      // user is logged it but does not own the URL with the given ID
      const errorMessage = {
        heading: `No URL found for ${users[req.session.userID].email}`
      };
      res.render('error', errorMessage);
    }
  } else {
    // user is not logged in
    const errorMessage = {
      heading: 'Not Logged In'
    };
    res.render('error', errorMessage);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  if (validUser(req, users)) {
    if (urlDatabase[req.params.shortURL] !== undefined && urlDatabase[req.params.shortURL].userID === req.session.userID) {
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        users: users[req.session.userID],
        uniqueVistors: analytics.urlsUniqiueVisitCount[req.params.shortURL].length,
        visitors: analytics.urlsVisitCount[req.params.shortURL]
      };
      res.render('urls_show', templateVars);
    } else {
      // user is logged it but does not own the URL with the given ID
      const errorMessage = {
        users: users[req.session.userID],
        heading: `No URL found for ${users[req.session.userID].email}`
      };
      res.render('error', errorMessage);
    }
  } else {
    // user is not logged in
    const errorMessage = {
      heading: 'Not Logged In'
    };
    res.render('error', errorMessage);
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (req.cookies['visitor_id'] === undefined) {
    res.cookie('visitor_id', generateRandomString());
  }
  if (urlDatabase[req.params.shortURL] !== undefined) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    if (!longURL.toLowerCase().includes('http://') && !longURL.toLowerCase().includes('https://')) {
      longURL = 'http://' + longURL;
    }
    if (analytics.urlsVisitCount[req.params.shortURL] !== undefined) {
      analytics.urlsVisitCount[req.params.shortURL].push([req.cookies['visitor_id'], getDateTime()]);
      if (!analytics.urlsUniqiueVisitCount[req.params.shortURL].includes(req.cookies['visitor_id'])) {
        analytics.urlsUniqiueVisitCount[req.params.shortURL].push(req.cookies['visitor_id']);
      }
    }
    res.redirect(longURL);
  } else {
    // URL for the given ID does not exist
    const errorMessage = {
      heading: 'URL Not Found'
    };
    res.status(404).render('error', errorMessage);
  }
});

app.get('/login', (req, res) => {
  if (validUser(req, users)) {
    res.redirect(`/urls`);
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  if (req.body.email !== undefined && req.body.password !== undefined) {
    const doesUserExist = getUserByEmail(req.body.email, users);
    if (doesUserExist && doesUserExist.email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, doesUserExist.password)) {
        req.session.userID = doesUserExist.id;
        return res.redirect(`/urls`);
      }
    }
  }
  const errorMessage = {
    heading: 'username or password incorrect'
  };
  res.status(403).render('error', errorMessage);
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {
  if (validUser(req, users)) {
    res.redirect(`/urls`);
  } else {
    res.render('register');
  }
});

app.post('/register', (req, res) => {
  if (req.body.email !== undefined && req.body.password !== undefined) {
    if (getUserByEmail(req.body.email, users)) {
      const errorMessage = {
        heading: 'Email already registered'
      };
      res.status(400).render('error', errorMessage);
    } else {
      const randomID = generateRandomString();
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.userID = randomID;
      res.redirect('/urls');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});