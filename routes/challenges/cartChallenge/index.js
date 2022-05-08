$(document).ready(async function () {
    // load cart
    await LoadCart()

    // load challenge
    await LoadChallenge()

})

async function LoadChallenge() {
    var response = await fetch(document.location + "/api/challenge")
    response.json().then(data => {
        console.log($("#challenge-input").text())
        $("#challengeId").val(data.challengeId);
        $("#challenge-text").text(data.question);
    })
}

async function LoadCart() {
    var response = await fetch(document.location + "/api/cart")
    response.json().then(data => {
        var element = "";
        data.products.forEach(prod => {
            // render elements
            element += `
               <div class="cart-item">
                   <span class="bold">${prod.name}</span>
                   <img src="${prod.image}" alt="shoe">
              </div>`
        })

        console.log(element);
        $("#basket-items").html(element)
    })
}

document.getElementById("clear-cart").onclick = async function () {
    var response = await fetch(document.location + "/api/cart", { method: "DELETE" })
    response.json().then(
        body => {
            location.reload();
        }
    );


}

document.getElementById("add-to-cart").onclick = async function () {
    var challengeId = $("#challengeId").val();
    var challengeAnswer = $("#challenge-input").val();
    var pid = $("#pid").val();

    var response = await fetch(document.location + "/api/cart", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            "pid": pid,
            "challengeId": challengeId,
            "challengeAnswer": challengeAnswer
        })
    })

    response.json().then(
        body => {
            if (body.success) {
                location.reload();
            } else {
                $("#cart-error").text(body.error)
            }
        }
    );


}