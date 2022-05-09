$(document).ready(async function () {
    await LoadCart()
})

async function LoadCart() {
    var response = await fetch(document.location + "/api/cart")
    response.json().then(data => {
        var element = "";
        data.products.forEach(prod => {
            element += `
               <div class="cart-item">
                   <span class="bold">${prod.name}</span>
                   <img src="${prod.image}" alt="shoe">
              </div>`
        })

        
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
    var pid = $("#pid").val();

    var response = await fetch(document.location + "/api/cart", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            "pid": pid,
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