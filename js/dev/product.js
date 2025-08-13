import "./app.min.js";
import "./input.min.js";
import "./unimodal.min.js";
import "./swiper-core.min.js";
/* empty css                */
document.addEventListener("DOMContentLoaded", function() {
  const hasSliders = document.querySelector(".popular-section__items") || document.querySelector(".testimonials-slider") || document.querySelector(".articles-slider") || document.querySelector("[data-fls-slider]");
  const hasProductGrid = document.querySelector(".product-grid") || document.querySelector("#productItems") || document.querySelector(".product-grid__items");
  if (hasSliders && !hasProductGrid) {
    console.log(
      "🚫 Слайдерна сторінка виявлена - продуктовий скрипт пропущений"
    );
    return;
  }
  if (!hasProductGrid) {
    console.log("ℹ️ Продуктова сітка не знайдена - скрипт пропущений");
    return;
  }
  console.log("✅ Ініціалізація продуктової сторінки...");
});
let allProductElements = [];
let filteredProductElements = [];
let currentPage = 1;
const itemsPerPage = 9;
let currentSort = "default";
let activeFilters = {
  categories: [],
  priceRanges: []
};
const productItems = document.getElementById("productItems");
const totalCount = document.getElementById("totalCount");
const pagination = document.getElementById("pagination");
const filterBtn = document.getElementById("filterBtn");
const filterPanel = document.getElementById("filterPanel");
const sortBtn = document.getElementById("sortBtn");
const sortPanel = document.getElementById("sortPanel");
function extractProductData(element) {
  return {
    id: parseInt(element.dataset.id),
    name: element.dataset.name,
    category: element.dataset.category,
    price: parseFloat(element.dataset.price),
    description: element.dataset.description,
    slug: element.dataset.slug,
    element
    // Зберігаємо посилання на DOM-елемент
  };
}
function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    search: urlParams.get("search") || "",
    category: urlParams.get("category") || "",
    priceRange: urlParams.get("priceRange") || ""
  };
}
function updateURL(searchTerm = "") {
  const url = new URL(window.location);
  if (searchTerm) {
    url.searchParams.set("search", searchTerm);
  } else {
    url.searchParams.delete("search");
  }
  window.history.replaceState({}, "", url);
}
function showSearchMessage(searchTerm, resultsCount) {
  let searchMessage = document.getElementById("searchMessage");
  if (!searchMessage) {
    searchMessage = document.createElement("div");
    searchMessage.id = "searchMessage";
    searchMessage.className = "search-message";
    if (productItems) {
      productItems.parentNode.insertBefore(searchMessage, productItems);
    }
  }
  if (searchTerm) {
    const resultText = resultsCount === 1 ? "result" : "results";
    searchMessage.innerHTML = `
      <p>Search results for: "<strong>${searchTerm}</strong>"  
          <span class="results-count">(${resultsCount} ${resultText} found)</span>
          <button class="clear-search-btn" onclick="clearSearch()">✖ Clear search</button>
      </p>
    `;
    searchMessage.style.display = "block";
  } else {
    searchMessage.style.display = "none";
  }
}
window.clearSearch = function() {
  const searchInput = document.querySelector(".search-form__input");
  if (searchInput) {
    searchInput.value = "";
  }
  applyFilters("");
  updateURL();
  const searchMessage = document.getElementById("searchMessage");
  if (searchMessage) {
    searchMessage.style.display = "none";
  }
};
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
function scrollToSearchResults() {
  const productSearchForm = document.querySelector(".product-grid__search");
  const productItems2 = document.getElementById("productItems");
  const searchMessage = document.getElementById("searchMessage");
  let targetElement = null;
  if (searchMessage && searchMessage.style.display !== "none") {
    targetElement = searchMessage;
  } else if (productSearchForm) {
    targetElement = productSearchForm;
  } else if (productItems2) {
    targetElement = productItems2;
  }
  if (targetElement) {
    setTimeout(() => {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
      setTimeout(() => {
        const yOffset = -20;
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 300);
    }, 100);
  }
}
function setupEventListeners() {
  const searchInput = document.querySelector(".search-form__input");
  const searchForm = document.querySelector(".search-form");
  if (searchInput && searchForm) {
    searchInput.addEventListener("input", function(e) {
      validateSearchInput(e.target);
      if (e.target.value.length >= 3) {
        const searchTerm = e.target.value.toLowerCase();
        applyFilters(searchTerm);
        updateURL(searchTerm);
      } else if (e.target.value.length === 0) {
        applyFilters("");
        updateURL();
      }
    });
    searchForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const searchTerm = searchInput.value.trim();
      if (searchTerm.length >= 3) {
        applyFilters(searchTerm.toLowerCase());
        updateURL(searchTerm);
      }
    });
  }
  if (filterBtn && filterPanel) {
    filterBtn.addEventListener("click", toggleFilterPanel);
    document.addEventListener("click", handleOutsideClick);
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", handleFilterChange);
    });
  }
  if (sortBtn && sortPanel) {
    sortBtn.addEventListener("click", toggleSortPanel);
    document.querySelectorAll(".sort-option").forEach((option) => {
      option.addEventListener("click", handleSort);
    });
  }
}
function toggleFilterPanel() {
  filterPanel.classList.toggle("active");
  filterBtn.classList.toggle("active");
  if (sortPanel) {
    sortPanel.classList.remove("active");
  }
}
function handleFilterChange(e) {
  const value = e.target.value;
  const isChecked = e.target.checked;
  if (["Chair", "Table", "Cupboard", "Decoration"].includes(value)) {
    if (isChecked) {
      activeFilters.categories.push(value);
    } else {
      activeFilters.categories = activeFilters.categories.filter(
        (cat) => cat !== value
      );
    }
  } else {
    if (isChecked) {
      activeFilters.priceRanges.push(value);
    } else {
      activeFilters.priceRanges = activeFilters.priceRanges.filter(
        (range) => range !== value
      );
    }
  }
  applyFilters();
}
function toggleSortPanel() {
  if (sortPanel) {
    sortPanel.classList.toggle("active");
    filterPanel.classList.remove("active");
    filterBtn.classList.remove("active");
  }
}
function handleSort(e) {
  const sortType = e.target.dataset.sort;
  currentSort = sortType;
  document.querySelectorAll(".sort-option").forEach((option) => {
    option.classList.remove("active");
  });
  e.target.classList.add("active");
  applyFilters();
  if (sortPanel) {
    sortPanel.classList.remove("active");
  }
}
function handleOutsideClick(e) {
  if (filterBtn && filterPanel) {
    if (!filterBtn.contains(e.target) && !filterPanel.contains(e.target)) {
      filterPanel.classList.remove("active");
      filterBtn.classList.remove("active");
    }
  }
  if (sortBtn && sortPanel) {
    if (!sortBtn.contains(e.target) && !sortPanel.contains(e.target)) {
      sortPanel.classList.remove("active");
    }
  }
}
function applyFilters(searchTerm = "") {
  if (!searchTerm) {
    const searchInput = document.querySelector(".search-form__input");
    searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  }
  let filteredData = allProductElements.map(extractProductData);
  const originalSearchTerm = searchTerm;
  if (searchTerm && searchTerm.length >= 3) {
    filteredData = filteredData.filter(
      (product) => product.name.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm)
    );
  }
  if (activeFilters.categories.length > 0) {
    filteredData = filteredData.filter(
      (product) => activeFilters.categories.includes(product.category)
    );
  }
  if (activeFilters.priceRanges.length > 0) {
    filteredData = filteredData.filter((product) => {
      return activeFilters.priceRanges.some((range) => {
        switch (range) {
          case "under50":
            return product.price < 50;
          case "50to100":
            return product.price >= 50 && product.price <= 100;
          case "over100":
            return product.price > 100;
          default:
            return true;
        }
      });
    });
  }
  switch (currentSort) {
    case "name":
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price-low":
      filteredData.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredData.sort((a, b) => b.price - a.price);
      break;
  }
  filteredProductElements = filteredData.map((data) => data.element);
  currentPage = 1;
  if (originalSearchTerm && originalSearchTerm.length >= 3) {
    showSearchMessage(originalSearchTerm, filteredData.length);
  } else {
    showSearchMessage("", 0);
  }
  renderProducts();
  updatePagination();
  updateTotalCount();
}
function renderProducts() {
  if (!productItems) return;
  productItems.innerHTML = "";
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentElements = filteredProductElements.slice(startIndex, endIndex);
  if (currentElements.length === 0) {
    productItems.innerHTML = '<div class="loading">No products found</div>';
    return;
  }
  currentElements.forEach((el) => {
    productItems.appendChild(el);
  });
  const images = productItems.querySelectorAll(".product-item__image-grid");
  images.forEach((img) => {
    img.addEventListener("error", function() {
      img.style.display = "none";
      img.alt = "Image not available";
    });
  });
}
function generatePaginationPages(currentPage2, totalPages) {
  const pages = [];
  const maxVisiblePages = 5;
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage2 <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage2 >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(
        1,
        "...",
        currentPage2 - 1,
        currentPage2,
        currentPage2 + 1,
        "...",
        totalPages
      );
    }
  }
  return pages;
}
function updatePagination() {
  if (!pagination) return;
  const totalPages = Math.ceil(filteredProductElements.length / itemsPerPage);
  if (totalPages === 0) {
    pagination.innerHTML = "";
    return;
  }
  const pages = generatePaginationPages(currentPage, totalPages);
  let paginationHTML = `
    <button
      class="pagination-btn --icon-left-arrow-product"
      ${currentPage === 1 ? "disabled" : ""}
      onclick="changePage(${currentPage - 1})"
    ></button>
  `;
  pages.forEach((page) => {
    if (page === "...") {
      paginationHTML += '<span class="pagination-ellipsis --icon-dots"></span>';
    } else if (page === currentPage) {
      paginationHTML += `<span class="pagination-current">${page}</span>`;
    } else {
      paginationHTML += `<span class="pagination-number" onclick="changePage(${page})">${page}</span>`;
    }
  });
  paginationHTML += `
    <button
      class="pagination-btn --icon-right-arrow-product"
      ${currentPage === totalPages ? "disabled" : ""}
      onclick="changePage(${currentPage + 1})"
    ></button>
  `;
  pagination.innerHTML = paginationHTML;
}
function updateTotalCount() {
  if (totalCount) {
    totalCount.textContent = filteredProductElements.length;
  }
}
function changePage(newPage) {
  const totalPages = Math.ceil(filteredProductElements.length / itemsPerPage);
  if (newPage < 1 || newPage > totalPages) {
    return;
  }
  currentPage = newPage;
  renderProducts();
  updatePagination();
  if (productItems) {
    productItems.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
function init() {
  const params = getUrlParams();
  if (params.search) {
    const searchInput = document.querySelector(".search-form__input");
    if (searchInput) {
      searchInput.value = params.search;
    }
    applyFilters(params.search);
    scrollToSearchResults();
  } else {
    renderProducts();
  }
  setupEventListeners();
  updatePagination();
  updateTotalCount();
}
window.changePage = changePage;
document.addEventListener("DOMContentLoaded", function() {
  if (document.querySelector(".product-grid") || window.location.pathname.includes("product.html")) {
    allProductElements = Array.from(
      document.querySelectorAll("#productItems article[data-id]")
    );
    filteredProductElements = [...allProductElements];
    allProductElements = allProductElements.map((el) => el.cloneNode(true));
    filteredProductElements = [...allProductElements];
    init();
  }
});
