
    (function () {
      try {
        const savedDark = localStorage.getItem("maulCommerceDarkMode") === "true";
        document.documentElement.dataset.productsTheme =
          savedDark ? "dark" : "light";
      } catch (error) {
        document.documentElement.dataset.productsTheme = "light";
      }
    })();
