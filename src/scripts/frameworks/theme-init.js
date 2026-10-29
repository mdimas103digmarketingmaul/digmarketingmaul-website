
    (function () {
      try {
        const savedTheme = localStorage.getItem("maulArticleTheme");
        document.documentElement.dataset.articleTheme =
          savedTheme === "dark" ? "dark" : "light";
      } catch (error) {
        document.documentElement.dataset.articleTheme = "light";
      }
    })();
