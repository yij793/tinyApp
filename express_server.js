var express = require("express");// adding express into our servers
var app = express();/// store express() in a var
var PORT = 8081; // default port 8081
const bodyParser = require("body-parser"); ///add bodyParser into our servers
const cookie = require('cookie');// add cookie to our server
const cookieParser = require('cookie-parser');
app.use(cookieParser()); ///using cookieParser

/// MY DATABASE
var urlDatabase = {
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
}
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
// port listener
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get('/urls', (req, res) => {
    let templateVars = { urls: urlDatabase, user_id: req.cookies.user_id };
    console.log(req.cookies.user_id)
    console.log(users)
    console.log(Object.keys(users).length)
    res.render("urls_index", templateVars)
})


app.get('/urls/new', (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_new", templateVars);
})
app.get("/urls/:shortURL", (req, res) => {
    let values = req.params.shortURL;
    let data = urlDatabase[values]
    let templateVars = { shortURL: values, longURL: data };
    res.render("urls_show", templateVars);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.post("/urls", (req, res) => {
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
    urlDatabase[generateRandomString()] = req.body.longURL
    console.log(urlDatabase)
});

app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    let values = req.params.shortURL;
    let data = urlDatabase[values]
    let templateVars = { shortURL: values, longURL: data };
    res.redirect(templateVars.longURL);
});
app.post('/urls/:shortURL/delete', (req, res) => {
    let values = req.params.shortURL;
    delete urlDatabase[values]
    res.redirect('/urls')
})

function generateRandomString() {
    var randomCode = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const possibleSize = possible.length
    for (i = 0; i < 6; i++) {
        randomCode += possible[Math.floor(Math.random() * possibleSize)]
    }
    return randomCode
}
function checkRegister(em) {
    const userID = Object.keys(users)
    console.log('userID is:   ', userID)
    const user = userID.filter(item => {
        return users[item].email === em
    })
    if (user > 0) {
        return false
    } else { return true }
}
function loginCheck(em, pw) {
    const userID = Object.keys(users)
    console.log('userID is:   ', userID)
    const user = userID.filter(item => {
        console.log('items are:  ', users[item].email)
        console.log('password input is:   ', pw)
        console.log('email input is:   ', typeof em)
        console.log('email inside users is :  ', typeof users[item].email)
        console.log('true or false?   ', users[item].email === em)
        return users[item].email === em
    })
    console.log('user name is:   ', user)
    if (user.length > 0) {
        console.log(users[user].password)
        if (users[user].password === pw) {
            return true
        }
    }


}
app.post('/login', (req, res) => {
    const { email, password } = req.body
    console.log('input password is   ', password)
    console.log('input email is   ', email)
    //see if email is in data and if it match the password
    if (loginCheck(email, password)) {
        res.cookie('user_id', email)
        res.redirect('/urls')
    } else {
        res.status(404)        // HTTP status 404: NotFound
            .send('user not found');
    }

})
app.get('/login', (req, res) => {

    res.render('urls_login')
})
app.post('/logout', (req, res) => {
    res.clearCookie('user_id')
    res.redirect('/urls')
})
app.get('/register', (req, res) => {
    const templateVars = ''
    res.render('urls_register', templateVars)

})
app.post('/register', (req, res) => {
    res.cookie('user_id', req.body.email)
    //// ID generator to give and ID of 'object size +1'
    const id = `user${Object.keys(users).length + 1}randomID`;
    const { email, password } = req.body
    users[id] = {
        id: id,
        email: email,
        password: password
    }
    if (checkRegister(email)) {
        res.cookie('user_id', email)
        res.redirect('/urls')
    } else {
        res.status(404)        // HTTP status 404: NotFound
            .send('this email has already been register');
    }






})
