var express = require("express");// adding express into our servers
var app = express();/// store express() in a var
var PORT = 8081;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser()); ///using cookieParser
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');


/// MY DATABASE
var urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcrypt.hashSync("dishwasher-funk", 10)
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
    const userID = req.cookies.ids;
    const email = req.cookies.user_id;
    const id_longURL = urlsForUser(userID);
    const id_shortURL = findShortURL(userID);
    const totalLength = id_longURL.length;
    const templateVars = { urls: id_longURL, user_id: userID, shortURL: id_shortURL, userEmail: email, totalLength: totalLength };
    // console.log('url is:   ', templateVars.urls)
    // console.log('shortURL is:   ', templateVars.shortURL)
    // console.log('user_id is:    ', templateVars.user_id)
    res.render("urls_index", templateVars)
})


app.get('/urls/new', (req, res) => {
    let templateVars = { urls: urlDatabase, user_id: req.cookies.user_id };
    // console.log(templateVars.user_id)
    res.render("urls_new", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
    let values = req.params.shortURL;
    let data = urlDatabase[values]
    let templateVars = { shortURL: values, longURL: data };
    res.render("urls_show", templateVars);
});
app.post('/urls/:shortURL/updata', (req, res) => {

    const { longURL } = req.body;
    const { shortURL } = req.params
    res.redirect('/urls')
})
app.post("/urls", (req, res) => {
    const { longURL } = req.body;
    const randomID = generateRandomString()
    urlDatabase[randomID] = {
        longURL: longURL,
        userID: req.cookies.ids
    }
    res.redirect('/urls')

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
//////////////////////
/////////////////////
/////functions///////
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
    // console.log('userID is:   ', userID)
    const user = userID.filter(item => {
        return users[item].email === em
    })
    if (user > 0) {
        return false
    } else { return true }
}
function loginCheck(em, pw) {
    const userID = Object.keys(users)
    // console.log('userID is:   ', userID)
    const user = userID.filter(item => {
        // console.log('items are:  ', users[item].email)
        // console.log('password input is:   ', pw)
        // console.log('email input is:   ', typeof em)
        // console.log('email inside users is :  ', typeof users[item].email)
        // console.log('true or false?   ', users[item].email === em)
        return users[item].email === em
    })
    // console.log('user name is:   ', user)
    if (user.length > 0) {
        // console.log(users[user].password)
        return bcrypt.compareSync(pw, users[user].password)
    }


}
function findUserIDbyEmail(em) {
    const userID = Object.keys(users)
    const user = userID.filter(item => {
        return users[item].email === em
    })
    return user.join('')
}
function urlsForUser(id) {
    const urls = []
    for (item in urlDatabase) {
        if (id === urlDatabase[item].userID) {
            urls.push(urlDatabase[item].longURL)
        }
    }
    return urls
}
function findShortURL(id) {
    const dbKeys = Object.keys(urlDatabase);
    return dbKeys.filter(item => { return urlDatabase[item].userID === id })

}
//////////////////////
/////////////////////
////////////////////
app.post('/login', (req, res) => {
    const { email, password } = req.body
    // console.log('input password is   ', password)
    // console.log('input email is   ', email)
    //see if email is in data and if it match the password
    if (loginCheck(email, password)) {
        res.cookie('user_id', email)
        res.cookie('ids', findUserIDbyEmail(email))
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
    res.clearCookie('ids')
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
    const { email, password } = req.body // found in the req.params object
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
        id: id,
        email: email,
        password: hashedPassword
    }
    if (checkRegister(email)) {
        res.cookie('user_id', email)
        res.cookie('ids', id)
        res.redirect('/urls')
    } else {
        res.status(403)        // HTTP status 403
            .send('this email has already been register');
    }






})
