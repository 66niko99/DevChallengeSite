const express = require("express");
const path = require("path");
var btoa = require('btoa');
var atob = require('atob');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { json } = require("body-parser");

// static files
router.get("/index.js", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.js"))
})

//router.get("/queue.js", (req, res) => {
//    res.sendFile(path.join(__dirname, "/queue.js"))
//})

router.get("/queue.obf.js", (req, res) => {
    res.sendFile(path.join(__dirname, "/queue.obf.js"))
})

// storage
var carts = {}
var usedQueues = [];
var products = {
    "123432333": {
        "name": "Jordan 1",
        "image": "/public/images/jordan.png",
        "pid": "123432333"
    }
}

// cart functions
function RegisterNewCart() {
    var cartId = uuidv4();
    var cart = { products: [] }
    carts[cartId] = cart

    return cartId
}
function GetCart(cartId) {
    var cart = carts[cartId]
    if (cart == undefined) {
        return { products: [] }
    }

    return cart
}


// session functions
function NewSession() {
    // session will store queue id
    // queueId is just an ID that can be converted to a timestamp representing queue end time
    return btoa(`{"queueId": "` + NewQueue() + `"}`)
}
// setting your session cookie to the code this returns will beat the challenge
function GenFakeSession() {
    return btoa(`{"queueId": "` + btoa("123123" + "|1|") + `"}`)
}

// new queue ID
function NewQueue() {
    var queueTime = Math.floor(Math.random() * 30000) + 30000
    var queueEndTime = new Date().getTime() + queueTime

    var divider = (Math.floor(Math.random() * 5) + 3) * 2
    var queueId = uuidv4() + "|";

    for (i = 0; i < divider; i++) {
        queueId += Math.ceil(queueEndTime / divider) + "|"
    }

    return btoa(queueId)
}
// queue ID to timestamp conversion
function ParseQueue(queueId) {
    var queueEndTimestamp = 0;

    try {
        var split = atob(queueId).split("|")
    } catch {
        return 0;
    }

    split.shift();

    for (i = 0; i < split.length; i++) {
        var dur = parseInt(split[i])
        queueEndTimestamp += isNaN(dur) ? 0 : dur
    }

    return queueEndTimestamp
}


router.get("/api/cart", (req, res) => {
    var cart = { products: [] }
    var cartCookie = req.cookies.cartId;

    // get products from current cart cookie
    if (cartCookie == undefined) {
        var cartId = RegisterNewCart();
        res.cookie("cartId", cartId)
    } else {
        cart = GetCart(cartCookie)
    }

    res.json(cart);
})

router.delete("/api/cart", (req, res) => {
    // parse cart cookie
    var cart = { products: [] }
    var cartCookie = req.cookies.cartId;

    // get products from current cart
    if (cartCookie == undefined) {
        var cartId = RegisterNewCart();
        res.cookie("cartId", cartId)
    } else {
        carts[cartCookie] = cart;
    }

    res.json(cart);
})

router.post("/api/cart", (req, res) => {
    var pid = req.body.pid;
    var product = products[pid]

    // parse cart cookie
    var cart = { products: [] }
    var cartCookie = req.cookies.cartId;

    // get products from current cart cookie
    if (cartCookie == undefined) {
        cartCookie = RegisterNewCart();
        res.cookie("cartId", cartCookie)
    } else {
        cart = GetCart(cartCookie)
    }

    var response = {}
    // check user supplied pid
    if (pid == undefined) {
        response.success = false;
        response.error = "Missing product ID";

        res.json(response);
        return false
    }
    // check for product exist
    if (product == undefined) {
        response.success = false;
        response.error = "Product not found";

        res.json(response);
        return false
    }
    // check for max product qty
    var limitReached = false
    cart.products.forEach(element => {
        if (element.pid == pid) {
            limitReached = true
        }
    })
    if (limitReached) {
        response.success = false;
        response.error = "Max product quantity reached";

        res.json(response);
        return false
    }

    // parse / create session
    var sessionCookie = req.cookies.session;
    var session = {};
    if (sessionCookie == undefined) {
        sessionCookie = NewSession();
        res.cookie("session", sessionCookie)
    }

    try {
        // try to parse session cookie
        session = JSON.parse(atob(sessionCookie))
    } catch {
        // error parsing, so create new session
        sessionCookie = NewSession();
        res.cookie("session", sessionCookie)

        // parse new session
        session = JSON.parse(atob(sessionCookie))
    }

    var queueId = session["queueId"]
    // session doesn't have queueId, so recreate it
    if (queueId == undefined) {
        sessionCookie = NewSession();
        res.cookie("session", sessionCookie)

        // parse new session
        session = JSON.parse(atob(sessionCookie))
        queueId = session["queueId"]
    }

    var queueEndTime = 0;
    try {
        queueEndTime = ParseQueue(queueId)
        if (queueEndTime == 0 || isNaN(queueEndTime)) {
            // queue ID is invalid
            sessionCookie = NewSession();
            res.cookie("session", sessionCookie)

            response.success = false;
            response.error = "Invalid spot in line";
            
            res.json(response);
            return false
        }
    } catch {
        // queue ID is invalid
        sessionCookie = NewSession();
        res.cookie("session", sessionCookie)

        response.success = false;
        response.error = "Invalid spot in line";

        res.json(response);
        return false
    }

    if (usedQueues.includes(queueId)) {
        // queue ID is used
        sessionCookie = NewSession();
        res.cookie("session", sessionCookie)

        response.success = false;
        response.error = "Invalid spot in line";

        res.json(response);
        return false
    }

    console.log(queueEndTime - new Date().getTime())

    if ((queueEndTime - new Date().getTime()) >= 0) {
        response.success = false;
        response.error = "Please wait in line";

        res.json(response);
        return false
    }

    usedQueues.push(queueId);

    // update cart obj
    response.success = true
    response.product = product
    cart.products.push(product)

    // update cart store
    carts[cartCookie] = cart

    res.json(response)
})

module.exports = router;