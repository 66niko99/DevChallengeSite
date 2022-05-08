const express = require("express");
const path = require("path");
var btoa = require('btoa');
var atob = require('atob');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

var challenges = {
    "test": 2
}

var products = {
    "123432333": {
        "name": "Jordan 1",
        "image": "/public/images/jordan.png",
        "pid": "123432333"
    }
}

router.get("/obf.index.js", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.js"))
})


router.get("/api/cart", (req, res) => {
    // parse cart cookie
    var cart = { products: [] }
    var cartCookie = req.cookies.cart;

    // get products from current cart cookie
    if (cartCookie != undefined) {
        try {
            var currentCart = JSON.parse(atob(cartCookie))
            currentCart.products.forEach(element => cart.products.push(element))
        } catch { }
    }

    res.json(cart);
})

router.delete("/api/cart", (req, res) => {
    // parse cart cookie
    var cart = { products: [] }
    res.cookie("cart", btoa(JSON.stringify(cart)))
    res.json(cart);
})

router.post("/api/cart", (req, res) => {
    var challengeId = req.body.challengeId;
    var challengeAnswer = req.body.challengeAnswer;

    var pid = req.body.pid;
    var product = products[pid]

    // parse cart cookie
    var cart = { products: [] }
    var cartCookie = req.cookies.cart;
    res.cookie("cart", btoa(JSON.stringify(cart)))

    // get products from current cart cookie
    if (cartCookie != undefined) {
        try {
            var currentCart = JSON.parse(atob(cartCookie))
            currentCart.products.forEach(element => cart.products.push(element))
        } catch { }
    }

    var response = {}

    // validate product and pid
    if (pid == undefined) {
        response.success = false;
        response.error = "Missing product ID";

        res.json(response);
        return false
    }

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


    // validate challenge
    if (challengeId == undefined) {
        response.success = false;
        response.error = "Missing challenge ID";

        res.json(response);
        return false
    } else if (challenges[challengeId] == undefined) {
        response.success = false;
        response.error = "Challenge not found";

        res.json(response);
        return false
    }

    if (challengeAnswer == undefined) {
        response.success = false;
        response.error = "Missing challenge answer";

        res.json(response);
        return false
    } else if (challenges[challengeId] != challengeAnswer) {
        response.success = false;
        response.error = "Challenge incorrect";

        res.json(response);
        return false
    }

    response.success = true
    response.product = product

    cart.products.push(product)
    console.log(cart)

    // set cart cookie
    res.cookie("cart", btoa(JSON.stringify(cart)))

    delete challenges[challengeId]
    res.json(response)
})

router.get("/api/challenge", (req, res) => {
    var num1 = Math.floor(Math.random() * 11);
    var num2 = Math.floor(Math.random() * 11);
    var id = uuidv4();

    challenges[id] = num1 + num2
    res.json({ "challengeId": id, "question": `What is ${num1} + ${num2}?` });
})

module.exports = router;