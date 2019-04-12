var express = require("express");// adding express into our servers
var app = express();/// store express() in a var
var PORT = 8081;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session') ///require cookie-session
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
app.use(cookieSession({
    name: 'session',
    keys: ['ids', 'user_id'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


/// MY DATABASES
var urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
    srFwes: { longURL: "https://www.baidu.com", userID: "userRandomID" }
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


const vistors = {
    b6UTxQ: { vist: 0, last_visit_time: 0, visitors: [] },
    i3BoGr: { vist: 0, last_visit_time: 0, visitors: [] },
    srFwes: { vist: 0, last_visit_time: 0, visitors: [] }
}
////////////////////////
////////////////////////
/////MY Functions///////


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
    let dbKeys = Object.keys(urlDatabase);
    const newkeys = dbKeys.filter(item => { return urlDatabase[item].userID === id })

    return newkeys

}
//////////////////////
/////////////////////
////////////////////
//////MY SERVERSE///


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
    const userID = req.session.ids;
    console.log('user ID is', userID)

    const email = req.session.user_id;
    console.log('user email is', email)
    const id_longURL = urlsForUser(userID);
    console.log('user long url is ', id_longURL)

    const id_shortURL = findShortURL(userID);
    console.log('user shorturl is', findShortURL('userRandomID'))
    const URLdb = urlDatabase
    const totalLength = id_longURL.length;

    const allShortURLs = Object.keys(urlDatabase)


    const templateVars = {
        urls: id_longURL,
        user_id: userID,
        shortURL: id_shortURL,
        userEmail: email,
        totalLength: totalLength,
        showShorturls: allShortURLs,
        urlDB: URLdb
    };
    // console.log('url is:   ', templateVars.urls)
    // console.log('shortURL is:   ', templateVars.shortURL)
    // console.log('user_id is:    ', templateVars.user_id)
    res.render("urls_index", templateVars)
})


app.get('/urls/new', (req, res) => {
    let templateVars = { urls: urlDatabase, user_id: req.session.user_id };
    // console.log(templateVars.user_id)
    res.render("urls_new", templateVars);
})


app.get("/urls/:shortURL", (req, res) => {
    let values = req.params.shortURL;
    let data = urlDatabase[values]
    let { vist } = vistors[values]
    let templateVars = { shortURL: values, longURL: data, view: vist };
    res.render("urls_show", templateVars);
});


app.post('/urls/:shortURL/updata', (req, res) => {

    const { longURL } = req.body;
    // console.log('longurl is :   ', longURL)
    const { shortURL } = req.params

    // console.log('showURL is:', shortURL)
    // console.log('Longurl in database', urlDatabase[shortURL])
    // console.log('urlDATABASE IS :     ', urlDatabase)

    urlDatabase[shortURL].longURL = longURL
    res.redirect('/urls')
})
app.post("/urls", (req, res) => {
    const { longURL } = req.body;
    const randomID = generateRandomString()
    urlDatabase[randomID] = {
        longURL: longURL,
        userID: req.session.ids
    }
    vistors[randomID] = {
        vist: 0, last_visit_time: 0, visitors: []
    }
    console.log('vistor DB IS NOW:    ', vistors)
    console.log('now urlDatabase is : ', urlDatabase)
    res.redirect('/urls')

});

app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    const { shortURL } = req.params;
    const { longURL } = urlDatabase[shortURL]
    vistors[shortURL].vist += 1
    vistors[shortURL].last_visit_time = new Date()
    vistors[shortURL].visitors.push(req.session.user_id)
    console.log(vistors)
    res.redirect(longURL);
});
app.post('/urls/:shortURL/delete', (req, res) => {
    let values = req.params.shortURL;
    delete urlDatabase[values]
    res.redirect('/urls')
})
app.post('/login', (req, res) => {
    const { email, password } = req.body
    // console.log('input password is   ', password)
    // console.log('input email is   ', email)
    //see if email is in data and if it match the password
    if (loginCheck(email, password)) {
        req.session.user_id = email
        req.session.ids = findUserIDbyEmail(email)
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
    // res.clearCookie('user_id')
    // res.clearCookie('ids')
    req.session = null
    res.redirect('/urls')
})
app.get('/register', (req, res) => {
    const templateVars = ''
    res.render('urls_register', templateVars)

})
app.post('/register', (req, res) => {
    req.session.user_id = req.body.email
    console.log(req.session.user_id)
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
        req.session.user_id = email
        req.session.ids = id
        res.redirect('/urls')
    } else {
        res.status(403)        // HTTP status 403
            .send('this email has already been register');
    }






})
