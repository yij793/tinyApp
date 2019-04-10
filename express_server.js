var express = require("express");// adding express into our servers
var app = express();/// store express() in a var
var PORT = 8081; // default port 8081
const bodyParser = require("body-parser"); ///add bodyParser into our servers

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};
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
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars)
})
/*app.get("/urls/:shortURL", (req, res) => {
    let values = req.params.shortURL;
    let data = urlDatabase[values]
    let templateVars = { shortURL: values, longURL: data };
    res.render("urls_show", templateVars);
});
*/
app.get('/urls/new', (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_new", templateVars);
})

app.use(bodyParser.urlencoded({ extended: true }));
app.post("/urls", (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
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