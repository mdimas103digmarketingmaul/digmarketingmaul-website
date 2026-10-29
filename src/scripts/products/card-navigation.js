
    (function () {
      document.querySelectorAll(".js-detail-card[data-detail-url]").forEach(function (card) {
        card.addEventListener("click", function (event) {
          if (event.target.closest("a,button,input,select,textarea")) return;
          window.location.href = card.dataset.detailUrl;
        });
        card.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            window.location.href = card.dataset.detailUrl;
          }
        });
      });
    })();
