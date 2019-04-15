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


/// URL DATABASES
var urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
    srFwes: { longURL: "https://www.baidu.com", userID: "userRandomID" }
};

// User DATAbase
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

// visttor Database
const vistors = {
    b6UTxQ: { vist: 0, last_visit_time: 0, visitors: [] },
    i3BoGr: { vist: 0, last_visit_time: 0, visitors: [] },
    srFwes: { vist: 0, last_visit_time: 0, visitors: [] }
}
////////////////////////
////////////////////////
/////MY Functions///////

//give a random 6 digital code
function generateRandomString() {
    var randomCode = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const possibleSize = possible.length
    for (i = 0; i < 6; i++) {
        randomCode += possible[Math.floor(Math.random() * possibleSize)]
    }
    return randomCode
}

// check if email has been register
function checkRegister(em) {
    if (em) {
        const userID = Object.keys(users)
        const user = userID.filter(item => {
            return users[item].email === em
        })
        if (user.length > 0) {
            return false
        } else {
            return true
        }
    }
}


function loginCheck(em, pw) {
    const userID = Object.keys(users)
    const user = userID.filter(item => {
        return users[item].email === em
    })
    if (user.length > 0) {
        return bcrypt.compareSync(pw, users[user].password)
    }


}

// using user email to find the user ID
function findUserIDbyEmail(em) {
    const userID = Object.keys(users)
    const user = userID.filter(item => {
        return users[item].email === em
    })
    return user.join('')
}

// using user_id to find the longURL that user saved
function urlsForUser(id) {
    const urls = []
    for (item in urlDatabase) {
        if (id === urlDatabase[item].userID) {
            urls.push(urlDatabase[item].longURL)
        }
    }
    return urls
}

// find the short URL from URLdatabse by input the user_ID
function findShortURL(id) {
    let dbKeys = Object.keys(urlDatabase);
    const newkeys = dbKeys.filter(item => { return urlDatabase[item].userID === id })

    return newkeys

}
/// check password is large than 8 or not
function passwordCheck(ps) {
    if (ps.length >= 8) {
        return true
    }
}
//////////////////////
//////////////////////
//////////////////////
//////MY SERVERSE/////


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
    res.render('hello')
});

app.post('/urls', (req, res) => {
    const { longURL } = req.body;
    const randomID = generateRandomString() // generator random shortURLs
    urlDatabase[randomID] = {    ///creating new obj data in urlDatabase with the shortURL we just generated
        longURL: longURL,
        userID: req.session.ids
    }
    vistors[randomID] = {       //creat vistors obj data named by new shortURLs
        vist: 0, last_visit_time: 0, visitors: []
    }
    res.redirect('/urls')
})
app.get('/urls', (req, res) => {
    const userID = req.session.ids;

    const email = req.session.user_id;  // cookie: user email

    const id_longURL = urlsForUser(userID); //  longURL(the web urls) that match the input id(cookie)

    const id_shortURL = findShortURL(userID);// ShortURL that match the input ID(cookie)

    const URLdb = urlDatabase;

    const totalLength = id_longURL.length; // total length of longURLS that store in unique user

    const allShortURLs = Object.keys(urlDatabase);// all shortURL in an array

    const views = vistors; // visitors database

    const templateVars = {
        urls: id_longURL,
        user_id: userID,
        shortURL: id_shortURL,
        userEmail: email,
        totalLength: totalLength,
        showShorturls: allShortURLs,
        urlDB: URLdb,
        vistors: views
    };
    res.render("urls_index", templateVars)
})


app.get('/urls/new', (req, res) => {
    let templateVars = { urls: urlDatabase, user_id: req.session.user_id };
    res.render("urls_new", templateVars);
})


app.get("/urls/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    const longURL = urlDatabase[shortURL];
    const { vist } = vistors[shortURL];
    const templateVars = { shortURL: shortURL, longURL: longURL, view: vist };
    res.render("urls_show", templateVars);
});


app.post('/urls/:shortURL/updata', (req, res) => {

    const { longURL } = req.body;
    const { shortURL } = req.params
    urlDatabase[shortURL].longURL = longURL // updata old longURL with new one
    res.redirect('/urls')
})


app.get("/u/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    const { longURL } = urlDatabase[shortURL]
    vistors[shortURL].vist += 1         // track the vistors and vist times and the time user visted
    vistors[shortURL].last_visit_time = new Date()
    vistors[shortURL].visitors.push(req.session.user_id) //this part recode use_id as array every time a user visit the longURL.However, since it is an array it will still store the same id,going to changing the array to object so the same ID will only store once'
    res.redirect(longURL);
});
app.post('/urls/:shortURL/delete', (req, res) => {
    let values = req.params.shortURL;
    delete urlDatabase[values]
    res.redirect('/urls')
})
app.post('/login', (req, res) => {
    const { email, password } = req.body
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
    //// ID generator to give and ID of 'object size +1'
    const id = `user${Object.keys(users).length + 1}randomID`; //generte new userID user{+1}randomID
    const { email, password } = req.body // found in the req.params object
    const hashedPassword = bcrypt.hashSync(password, 10);
    if (checkRegister(email)) {
        req.session.user_id = email
        req.session.ids = id
        if (passwordCheck(password)) {
            users[id] = {
                id: id,
                email: email,
                password: hashedPassword
            }
            res.redirect('/urls')
        } else {
            res.status(404)
                .send('password is less than 8')
        }
    } else {
        res.status(404)
            .send('you cannot register with that email, it either been register or invailed')
    }
})

