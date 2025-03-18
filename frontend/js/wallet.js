if (!localStorage.getItem("walletBalance")) {
  localStorage.setItem("walletBalance", JSON.stringify(50.00));

}
function updateWalletDisplay() {
    let walletBalance = JSON.parse(localStorage.getItem("walletBalance")) || 0;
    document.getElementById("wallet-amount").innerText = `$${walletBalance.toFixed(2)}`;}
function setWalletBalance(amount) {
    localStorage.setItem("walletBalance", JSON.stringify(amount));
    updateWalletDisplay(); // Update UI after balance change
  }
    document.addEventListener("DOMContentLoaded", updateWalletDisplay);