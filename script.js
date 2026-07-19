document.addEventListener("DOMContentLoaded", function () {
  const actionButton = document.getElementById("actionButton");
  const message = document.getElementById("message");

  if (!actionButton || !message) {
    console.error("Tombol atau elemen pesan tidak ditemukan.");
    return;
  }

  actionButton.addEventListener("click", function () {
    message.textContent =
      "Tombol berhasil diklik. JavaScript sedang bekerja!";

    actionButton.textContent = "Berhasil Diklik";
  });

  console.log("Website Dig Marketing Maul berhasil dimuat.");
});
