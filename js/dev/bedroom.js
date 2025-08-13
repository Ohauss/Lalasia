import "./app.min.js";
import "./unimodal.min.js";
/* empty css         */
/* empty css                */
class BedroomAnimations {
  constructor() {
    this.init();
  }
  init() {
    if (!window.IntersectionObserver) {
      this.fallbackAnimation();
      return;
    }
    this.setupObserver();
    this.addAnimationClasses();
  }
  setupObserver() {
    const options = {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.2
    };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }
  addAnimationClasses() {
    const animateElements = document.querySelectorAll(`
      .block-left__text,
      .block-right p,
      .block-2__text,
      .block-3__text,
      figure
    `);
    animateElements.forEach((element, index) => {
      element.classList.add("animate-element");
      const delay = (index + 1) * 0.1;
      element.style.transitionDelay = `${delay}s`;
      this.observer.observe(element);
    });
  }
  // Fallback для старих браузерів
  fallbackAnimation() {
    const elements = document.querySelectorAll(`
      .block-left__text,
      .block-right p,
      .block-2__text,
      .block-3__text,
      figure
    `);
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add("animate-in");
      }, index * 200);
    });
  }
}
function initTextExpansion() {
  const expandableTexts = document.querySelectorAll(".expandable-text");
  expandableTexts.forEach((text) => {
    text.style.cursor = "pointer";
    text.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle("collapsed");
      this.classList.toggle("expanded");
      const isExpanded = this.classList.contains("expanded");
      this.setAttribute("aria-expanded", isExpanded);
    });
    text.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
    });
    if (!text.hasAttribute("tabindex")) {
      text.setAttribute("tabindex", "0");
    }
    const isCollapsed = text.classList.contains("collapsed");
    text.setAttribute("aria-expanded", !isCollapsed);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  new BedroomAnimations();
  initTextExpansion();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.closest(".article-bedroom")) {
      const nextSection = document.querySelector(".article-bedroom").nextElementSibling;
      if (nextSection) {
        nextSection.focus();
      }
    }
  }
});
