document.addEventListener("DOMContentLoaded", function () {
  // ===== GET HTML ELEMENTS =====
  const searchInput = document.getElementById("news-search");
  const clearButton = document.getElementById("clear-search");
  const themeButton = document.getElementById("theme-btn");
  const showFavoritesButton = document.getElementById("show-favorites");
  const categoryButtons = document.querySelectorAll(".category-btn");

  const mainArticles = document.querySelectorAll("section article");
  const headlineCards = document.querySelectorAll(
    "#more-headlines .headline-card",
  );

  const allNewsArticles = document.querySelectorAll(
    "section article, #more-headlines .headline-card",
  );

  // ===== DARK MODE =====
  const savedTheme = localStorage.getItem("pulse-news-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeButton) themeButton.textContent = "☀️ Light Mode";
  }

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");

      const isDarkMode = document.body.classList.contains("dark-mode");

      themeButton.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";

      localStorage.setItem("pulse-news-theme", isDarkMode ? "dark" : "light");
    });
  }

  // ===== FAVOURITES =====
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem("pulse-news-favorites") || "[]");
    } catch (error) {
      return [];
    }
  }

  function updateFavoriteButtons() {
    const savedFavorites = getFavorites();

    document.querySelectorAll(".favorite-btn").forEach(function (button) {
      const article = button.closest("article");
      if (!article) return;

      const articleId = article.id || "top-story";
      const isFavorite = savedFavorites.includes(articleId);

      button.textContent = isFavorite ? "❤️ Saved" : "🤍 Favourite";
      button.setAttribute("aria-pressed", String(isFavorite));
    });
  }

  document.querySelectorAll(".favorite-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const article = button.closest("article");
      if (!article) return;

      const articleId = article.id || "top-story";
      let savedFavorites = getFavorites();

      if (savedFavorites.includes(articleId)) {
        savedFavorites = savedFavorites.filter(function (id) {
          return id !== articleId;
        });
      } else {
        savedFavorites.push(articleId);
      }

      localStorage.setItem(
        "pulse-news-favorites",
        JSON.stringify(savedFavorites),
      );

      updateFavoriteButtons();
      applyFilters();
    });
  });

  updateFavoriteButtons();

  // ===== SHOW MORE / SHOW LESS =====
  document.querySelectorAll(".read-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      const article = button.closest("article");
      if (!article) return;

      const extraText = article.querySelector(".article-extra");
      if (!extraText) return;

      extraText.hidden = !extraText.hidden;
      button.textContent = extraText.hidden ? "Show More" : "Show Less";
    });
  });

  // ===== SEARCH, FAVOURITES AND CATEGORY FILTERS =====
  let selectedCategory = "all";
  let showingFavoritesOnly = false;

  function applyFilters() {
    const searchText = searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";

    const savedFavorites = getFavorites();

    allNewsArticles.forEach(function (article) {
      const categoryLabel = article.querySelector(".news-category");
      const categoryText = categoryLabel
        ? categoryLabel.textContent.toLowerCase().trim()
        : "";

      const articleId = article.id || "top-story";

      const matchesSearch = article.textContent
        .toLowerCase()
        .includes(searchText);

      const matchesCategory =
        selectedCategory === "all" || categoryText.includes(selectedCategory);

      const matchesFavorites =
        !showingFavoritesOnly || savedFavorites.includes(articleId);

      article.style.display =
        matchesSearch && matchesCategory && matchesFavorites ? "" : "none";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // ===== CLEAR SEARCH =====
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }

      applyFilters();
    });
  }

  // ===== SHOW FAVOURITES =====
  if (showFavoritesButton) {
    showFavoritesButton.addEventListener("click", function () {
      showingFavoritesOnly = !showingFavoritesOnly;

      showFavoritesButton.textContent = showingFavoritesOnly
        ? "📰 Show All News"
        : "❤️ Show Favourites";

      applyFilters();
    });
  }

  // ===== CATEGORY NAVIGATION WITH SCROLLING FIX =====
  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedCategory = button.dataset.category || "all";

      categoryButtons.forEach(function (categoryButton) {
        categoryButton.classList.remove("active");
      });

      button.classList.add("active");

      // Reset the search when choosing a category.
      if (searchInput) {
        searchInput.value = "";
      }

      // Show all stories when All News is selected.
      if (selectedCategory === "all") {
        showingFavoritesOnly = false;

        if (showFavoritesButton) {
          showFavoritesButton.textContent = "❤️ Show Favourites";
        }

        applyFilters();

        const home = document.getElementById("home");

        if (home) {
          setTimeout(function () {
            home.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        }

        return;
      }

      // Find the story matching the selected category.
      applyFilters();

      const matchingArticle = Array.from(allNewsArticles).find(
        function (article) {
          const categoryLabel = article.querySelector(".news-category");

          return (
            categoryLabel &&
            categoryLabel.textContent
              .toLowerCase()
              .trim()
              .includes(selectedCategory)
          );
        },
      );

      // Wait briefly for the page to update, then scroll to the story.
      if (matchingArticle) {
        setTimeout(function () {
          matchingArticle.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    });
  });

  // ===== LIVE DATE AND TIME =====
  function updateDateTime() {
    const dateElement = document.getElementById("current-date");
    const timeElement = document.getElementById("current-time");
    const now = new Date();

    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString("en-NG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    }
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);

  console.log("Pulse News is ready!");
});
