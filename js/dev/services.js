import "./app.min.js";
import "./unimodal.min.js";
/* empty css         */
/* empty css                */
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
