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
    document.addEventListener("DOMContentLoaded", updateWalletDisplay); window.alert = function(message) {
      if (typeof showUniMartToast === "function") {
        showUniMartToast(message);
      } else {
        console.log("Toast fallback:", message);
      }
    };
    function showUniMartToast(message) {
      const toast = document.getElementById("unimart-toast");
      const msgSpan = document.getElementById("unimart-toast-message");
    
      msgSpan.textContent = message;
      toast.classList.remove("hidden");
      toast.classList.add("show");
    
      // Hide after 3 seconds
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 300); // for fade-out effect
      }, 3000);
    }