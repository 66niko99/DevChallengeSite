const express = require("express");
const path = require("path");

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"))
})

app.get("/public/:file", (req, res) => {
    res.sendFile(path.join(__dirname, req.path))
})

app.get("/public/images/:file", (req, res) => {
    res.sendFile(path.join(__dirname, req.path))
})


app.use("/challenges", require("./routes/challenges/challenges"));
 

app.listen(PORT, () => console.log("Server started on port " + PORT));
