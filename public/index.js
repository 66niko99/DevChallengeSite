var challenges = {
    "challenges": [
        {
            "name": "Cart Challenge",
            "id": "cartChallenge",
            "difficulty": "1/10",
            "challengeGoal": "The goal of this challenge is to get the item in your cart without " +
                "solving the challenge. Bonus points if you can bypass the item quantity limit.",
            "hints": [
                "Check the cart cookie.",
                "Base64 decode the cart cookie"
            ],
            "solution": `After adding to cart, you will be given a cart cookie. You can bypass the question simply by setting the cart cookie to one with the product in it. To bypass the product quantity limit, you first need to base64 decode the cookie. This will reveal all items in your cart. Duplicate the JSON object containing the product, then base64 encode your new cart. Use that as your new cart cookie. Refresh the page and you'll see your cart now has 2 items in it.`
        },
        {
            "name": "Queue Challenge",
            "id": "queueChallenge",
            "difficulty": "3/10",
            "challengeGoal": `When you try to add to cart, you'll be put in a queue. Once you've waited in queue, you'll be able to add to cart. The goal of this challenge is to add the item to your cart without waiting in the queue.`,
            "hints": [
                "Base64 decode the 'session' cookie",
                `Deobfuscate the 'queue.obf.js' file.`,
                `Base64 decode the 'queueId' from the decoded 'session' cookie.`,
            ],
            "solution": `The solution to this challenge is to edit your session cookie. Start by base64 decoding the 'session' cookie. After decoding it, you'll see a 'queueId' field. This ID contains information on when your queue time is up. If you base64 decode the cookie, you'll see it looks something like this:  <span style='font-size: 9px; display: block; margin: 5px;'>546bbec8-76ed-4e13-90b1-088cf1e53afb|275364709595|275364709595|275364709595|275364709595|275364709595|275364709595|</span>You can get the queue time from that string by first splitting it into an array with '|' as the delimeter. Then shift/remove the first element from the array. Now iterate over the array and add each number together. The resulting number will be the unix timestamp at which your queue is over. So to bypass queue, you can set your queueId to something like this: 'uuid|1|' (replacing 'uuid' with a unique ID). Base64 encode that string, then replace the queueId in your 'session' cookie with the resulting value. Next, base64 encode the session, and set your 'session' cookie to the resulting value. If done correctly, you won't need to wait in queue before adding to cart. Note that queueID's can only be used once, so you'll need to generate a new one with a unique ID each time.`
        }
    ]
}

// render challenges
$(document).ready(async function () {
    for (i = 0; i < challenges.challenges.length; i++) {
        var challengeInfo = challenges.challenges[i];

        var challengeDiv = document.createElement("div");
        challengeDiv.setAttribute("class", "challenge-info")
        challengeDiv.setAttribute("id", challengeInfo.id)

        // create base
        challengeDiv.innerHTML = `
        <a href="/challenges/${challengeInfo.id}" class="bold larger" target="_blank">${challengeInfo.name}</a>
        <span>Difficulty: ${challengeInfo.difficulty}</span>
        <div class="hints"></div>
        <span class="bold top-spacing">Challenge Goal</span>
        <p>${challengeInfo.challengeGoal}</p>
        `

        // create hints menu
        var challengeGoalBtn = document.createElement("span")
        challengeGoalBtn.innerHTML = "Challenge Goal"
        challengeGoalBtn.setAttribute("onclick", `ChangeInfo("${challengeInfo.id}", "Challenge Goal", "${challengeInfo.challengeGoal}")`)
        challengeDiv.getElementsByClassName("hints")[0].appendChild(challengeGoalBtn)

        // append hints
        for (h = 0; h < challengeInfo.hints.length; h++) {
            var challengeGoalBtn = document.createElement("span")
            challengeGoalBtn.innerHTML = `Hint ${h + 1}`
            challengeGoalBtn.setAttribute("onclick", `ChangeInfo("${challengeInfo.id}", "Hint ${h + 1}", "${challengeInfo.hints[h]}")`)

            challengeDiv.getElementsByClassName("hints")[0].appendChild(challengeGoalBtn)
        }

        var btn = document.createElement("span")
        btn.innerHTML = "Solution"
        btn.setAttribute("onclick", `ChangeInfo("${challengeInfo.id}", "Solution", "${challengeInfo.solution}")`)
        challengeDiv.getElementsByClassName("hints")[0].appendChild(btn)

        // append challenge to document
        document.getElementById("challenge-container").appendChild(challengeDiv);
    }
})

function ChangeInfo(challengeName, header, text) {
    $(`#${challengeName} .bold.top-spacing`).text(header)
    $(`#${challengeName} p`).html(text)
}

