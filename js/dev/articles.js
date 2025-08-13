import "./app.min.js";
import "./unimodal.min.js";
import "./swiper-core.min.js";
/* empty css         */
/* empty css                */
document.addEventListener("DOMContentLoaded", () => {
  const topicsTabsNav = document.querySelector(".topics-tabs-nav");
  if (!topicsTabsNav) return;
  const topicsTabsBtns = document.querySelectorAll(".topics-tabs-nav__btn");
  const topicsTabsItems = document.querySelectorAll(".topics-tabs__item");
  const loadMore = document.querySelector(".topics-more");
  const maxItems = 3;
  const showItemsByPath = (path) => {
    topicsTabsItems.forEach((el) => {
      el.classList.remove(
        "topics-tabs__item--visible",
        "topics-tabs__item--visible-more"
      );
    });
    const targetItems = path === "all" ? Array.from(topicsTabsItems) : Array.from(
      document.querySelectorAll(`.topics-item[data-target="${path}"]`)
    ).map((el) => el.closest(".topics-tabs__item"));
    targetItems.slice(0, maxItems).forEach((el) => {
      el.classList.add("topics-tabs__item--visible");
    });
    loadMore.style.display = targetItems.length > maxItems ? "inline-flex" : "none";
  };
  const activateFilterByPath = (path) => {
    const filterButton = Array.from(topicsTabsBtns).find(
      (btn) => btn.dataset.path === path
    );
    if (filterButton) {
      topicsTabsBtns.forEach((el) => {
        el.classList.remove("topics-tabs-nav__btn--active");
        el.setAttribute("aria-pressed", "false");
      });
      filterButton.classList.add("topics-tabs-nav__btn--active");
      filterButton.setAttribute("aria-pressed", "true");
      showItemsByPath(path);
    }
  };
  topicsTabsNav.addEventListener("click", (e) => {
    const target = e.target.closest(".topics-tabs-nav__btn");
    if (!target) return;
    topicsTabsBtns.forEach((el) => {
      el.classList.remove("topics-tabs-nav__btn--active");
      el.setAttribute("aria-pressed", "false");
    });
    target.classList.add("topics-tabs-nav__btn--active");
    target.setAttribute("aria-pressed", "true");
    showItemsByPath(target.dataset.path);
  });
  loadMore.addEventListener("click", () => {
    var _a;
    const path = (_a = document.querySelector(".topics-tabs-nav__btn--active")) == null ? void 0 : _a.dataset.path;
    const targetItems = path === "all" ? Array.from(topicsTabsItems) : Array.from(
      document.querySelectorAll(`.topics-item[data-target="${path}"]`)
    ).map((el) => el.closest(".topics-tabs__item"));
    targetItems.forEach((el) => {
      el.classList.add("topics-tabs__item--visible");
    });
    loadMore.style.display = "none";
  });
  const urlParams = new URLSearchParams(window.location.search);
  const filterPath = urlParams.get("filter");
  if (filterPath) {
    activateFilterByPath(filterPath);
  } else {
    const initialActiveTab = document.querySelector(
      ".topics-tabs-nav__btn--active"
    );
    if (initialActiveTab) {
      showItemsByPath(initialActiveTab.dataset.path);
    } else if (topicsTabsBtns.length) {
      topicsTabsBtns[0].classList.add("topics-tabs-nav__btn--active");
      topicsTabsBtns[0].setAttribute("aria-pressed", "true");
      showItemsByPath(topicsTabsBtns[0].dataset.path);
    } else {
      showItemsByPath("all");
    }
  }
});
function initScrollAnimation() {
  const animatedElements = document.querySelectorAll(
    ".fade-in, .slide-left, .slide-right"
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, index * 100);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    }
  );
  animatedElements.forEach((element) => {
    observer.observe(element);
  });
}
function initTextExpansion() {
  const expandableTexts = document.querySelectorAll(".expandable-text");
  expandableTexts.forEach((text) => {
    text.addEventListener("click", function() {
      this.classList.toggle("collapsed");
      this.classList.toggle("expanded");
    });
  });
}
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}
function initHoverEffects() {
  const articles = document.querySelectorAll(".portfolio__article");
  articles.forEach((article) => {
    article.addEventListener("mouseenter", function() {
      this.style.transform = "translateY(-8px) scale(1.02)";
    });
    article.addEventListener("mouseleave", function() {
      this.style.transform = "translateY(0) scale(1)";
    });
  });
}
document.addEventListener("DOMContentLoaded", function() {
  initScrollAnimation();
  initTextExpansion();
  initSmoothScroll();
  initHoverEffects();
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 100);
});
if ("IntersectionObserver" in window) ;
else {
  window.addEventListener("scroll", function() {
    const elements = document.querySelectorAll(".fade-in:not(.visible)");
    elements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("visible");
      }
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const tabsNavigation = document.querySelector(".tabs__navigation");
  if (!tabsNavigation) return;
  const tabsButtons = document.querySelectorAll(".tabs__title");
  const tabsBodies = document.querySelectorAll(".tabs__body");
  const loadMore = document.querySelector(".load-more-btn");
  const maxItems = 3;
  const normalizeCategory = (category) => category.toLowerCase().replace(/\s+/g, "-");
  const showArticlesByTab = (path) => {
    tabsBodies.forEach((body) => {
      body.querySelectorAll(".topic-card").forEach((article) => {
        article.classList.remove("topic-card--visible");
      });
    });
    let targetArticles = [];
    if (path === "all") {
      targetArticles = Array.from(
        tabsBodies[0].querySelectorAll(".topic-card")
      );
    } else {
      targetArticles = Array.from(
        document.querySelectorAll(`.topic-card__category`)
      ).filter((el) => normalizeCategory(el.textContent.trim()) === path).map((el) => el.closest(".topic-card"));
    }
    targetArticles.slice(0, maxItems).forEach((article) => {
      article.classList.add("topic-card--visible");
    });
    loadMore.style.display = targetArticles.length > maxItems ? "block" : "none";
  };
  const activateTabByPath = (path) => {
    const normalizedPath = normalizeCategory(path);
    const filterButton = Array.from(tabsButtons).find(
      (btn) => normalizeCategory(btn.textContent.trim()) === normalizedPath
    );
    if (filterButton) {
      tabsButtons.forEach((btn) => {
        btn.classList.remove("--tab-active");
        btn.setAttribute("aria-pressed", "false");
      });
      filterButton.classList.add("--tab-active");
      filterButton.setAttribute("aria-pressed", "true");
      showArticlesByTab(normalizedPath);
    }
  };
  tabsNavigation.addEventListener("click", (e) => {
    const target = e.target.closest(".tabs__title");
    if (!target) return;
    tabsButtons.forEach((btn) => {
      btn.classList.remove("--tab-active");
      btn.setAttribute("aria-pressed", "false");
    });
    target.classList.add("--tab-active");
    target.setAttribute("aria-pressed", "true");
    const path = normalizeCategory(target.textContent.trim());
    showArticlesByTab(path);
  });
  loadMore.addEventListener("click", () => {
    const activeTab = document.querySelector(".tabs__title.--tab-active");
    const path = normalizeCategory(activeTab.textContent.trim());
    let targetArticles = [];
    if (path === "all") {
      targetArticles = Array.from(
        tabsBodies[0].querySelectorAll(".topic-card")
      );
    } else {
      targetArticles = Array.from(
        document.querySelectorAll(`.topic-card__category`)
      ).filter((el) => normalizeCategory(el.textContent.trim()) === path).map((el) => el.closest(".topic-card"));
    }
    targetArticles.forEach((article) => {
      article.classList.add("topic-card--visible");
    });
    loadMore.style.display = "none";
  });
  const urlParams = new URLSearchParams(window.location.search);
  const filterPath = urlParams.get("filter");
  if (filterPath) {
    activateTabByPath(filterPath);
  } else {
    const initialActiveTab = document.querySelector(
      ".tabs__title.--tab-active"
    );
    if (initialActiveTab) {
      showArticlesByTab(normalizeCategory(initialActiveTab.textContent.trim()));
    } else if (tabsButtons.length) {
      tabsButtons[0].classList.add("--tab-active");
      tabsButtons[0].setAttribute("aria-pressed", "true");
      showArticlesByTab(normalizeCategory(tabsButtons[0].textContent.trim()));
    } else {
      showArticlesByTab("all");
    }
  }
});
