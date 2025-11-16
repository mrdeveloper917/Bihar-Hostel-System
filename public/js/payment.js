// place this file in your static public folder and reference it in EJS
document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.getElementById("payBtn");
  if (!payBtn) return;

  const AMOUNT = Number(payBtn.dataset.amount) || 5000;

  payBtn.addEventListener("click", async () => {
    try {
      // Create order on server
      const res = await fetch("/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: AMOUNT }),
      });
      const data = await res.json();
      if (!data.orderId) throw new Error("Order creation failed");

      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: "INR",
        name: "Bihar Polytechnic Hostel",
        description: "Hostel Fee Payment",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: data.amount,
              }),
            });

            const result = await verifyRes.json();

            if (result.success) {
              alert("Payment Successful! Fee Status Updated.");
              // redirect to fees page (or refresh)
              window.location.href = "/student/fees";
            } else {
              alert("Payment Verification Failed!");
            }
          } catch (err) {
            console.error(err);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          // if you have user email/name, set here to improve UX
        },
        theme: {
          color: "#007bff",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Could not initiate payment. Try again.");
    }
  });
});
