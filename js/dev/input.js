function validateSearchInput(input) {
  const value = input.value;
  let isValid = true;
  const cleanValue = value.replace(/[^A-Za-zА-Яа-я0-9\s\-]/g, "");
  if (cleanValue !== value) {
    input.value = cleanValue;
  }
  if (cleanValue.length > 0 && cleanValue.length < 3) {
    isValid = false;
  } else if (cleanValue.length > 80) {
    input.value = cleanValue.substring(0, 80);
    isValid = true;
  }
  const searchButton = document.querySelector(".search-form__button");
  if (searchButton) {
    searchButton.disabled = !isValid || cleanValue.length < 3;
  }
  return isValid;
}
function setupHomePageSearch() {
  const searchForm = document.querySelector(".search-form");
  const searchInput = document.querySelector(".search-form__input");
  if (!searchForm || !searchInput) {
    console.warn("Форма пошуку не знайдена на головній сторінці");
    return;
  }
  searchInput.addEventListener("input", function(e) {
    validateSearchInput(e.target);
  });
  searchForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm.length >= 3) {
      window.location.href = `./product.html?search=${encodeURIComponent(
        searchTerm
      )}`;
    } else {
      console.log("Need minimum 3 characters to search");
    }
  });
  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchTerm = this.value.trim();
      if (searchTerm.length >= 3) {
        window.location.href = `./product.html?search=${encodeURIComponent(
          searchTerm
        )}`;
      }
    }
  });
  console.log("Search setup for homepage initialized");
}
document.addEventListener("DOMContentLoaded", function() {
  if (document.querySelector(".input") || window.location.pathname.includes("index.html") || window.location.pathname === "/") {
    setupHomePageSearch();
  }
});
