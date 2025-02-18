let cartItems = [
    { id: 1, name: "Backpack", price: 20, quantity: 1, image: "backpack.jpg" },
    { id: 2, name: "Notebook", price: 4.99, quantity: 1, image: "notebook.jpg" }
    
];


// Function to render cart items
function renderCart() {
    let cartTable = document.getElementById("cart-items");
    cartTable.innerHTML = "";


    cartItems.forEach(item => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${item.image}" width="50"> ${item.name}</td>
            <td>$${item.price}</td>
            <td>
                <select class="quantity" data-id="${item.id}">
                    ${[1, 2, 3, 4, 5].map(q => `<option value="${q}" ${q === item.quantity ? "selected" : ""}>${q}</option>`).join("")}
                </select>
            </td>
            <td><button class="remove-item" data-id="${item.id}">🗑️</button></td>
        `;
        cartTable.appendChild(row);
    });


    updateSubtotal();
}


// Update subtotal
function updateSubtotal() {
    let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById("subtotal-price").innerText = `$${subtotal.toFixed(2)}`;
}


// Remove item
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-item")) {
        let id = parseInt(e.target.dataset.id);
        cartItems = cartItems.filter(item => item.id !== id);
        renderCart();
    }
});


// Update quantity
document.addEventListener("change", function (e) {
    if (e.target.classList.contains("quantity")) {
        let id = parseInt(e.target.dataset.id);
        let newQuantity = parseInt(e.target.value);
        cartItems.find(item => item.id === id).quantity = newQuantity;
        updateSubtotal();
    }
});


// Checkout step navigation
document.getElementById("step1").addEventListener("click", () => showStep("subtotal-step"));
document.getElementById("step2").addEventListener("click", () => showStep("shipping-step"));
document.getElementById("step3").addEventListener("click", () => showStep("confirm-step"));


function showStep(stepId) {
    document.querySelectorAll(".checkout-content > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(stepId).classList.remove("hidden");


    document.querySelectorAll(".checkout-steps button").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[id=${stepId.split("-")[0]}]`).classList.add("active");
}


// Confirm purchase
document.getElementById("confirm-purchase").addEventListener("click", function () {
    alert("Purchase confirmed!");
    cartItems = []; // Clear cart
    renderCart();
});


// Initialize cart
renderCart();
