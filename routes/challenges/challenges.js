const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/:challenge", (req, res) => {
    res.sendFile(path.join(__dirname, `/${req.params.challenge}/index.html`));
})

router.use("/cartChallenge", require("./cartChallenge/api"))
 
module.exports = router;