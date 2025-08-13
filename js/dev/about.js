import "./app.min.js";
import "./unimodal.min.js";
/* empty css         */
/* empty css                */
const videoBlock = document.querySelector(".video-block");
if (videoBlock) {
  const video = videoBlock.querySelector("video");
  const playBtn = videoBlock.querySelector(".video-block__play");
  const muteBtn = videoBlock.querySelector(".video-block__muted");
  if (video && playBtn) {
    playBtn.addEventListener("click", () => {
      videoBlock.classList.add("video-block--played");
      video.play().then(() => {
        video.controls = true;
        playBtn.classList.add("video-block__play--played");
      }).catch((error) => {
        console.error("Помилка відтворення відео:", error);
      });
    });
    video.addEventListener("pause", () => {
      videoBlock.classList.remove("video-block--played");
      video.controls = false;
      playBtn.classList.remove("video-block__play--played");
    });
    video.addEventListener("ended", () => {
      videoBlock.classList.remove("video-block--played");
      video.controls = false;
      playBtn.classList.remove("video-block__play--played");
    });
    if (muteBtn) {
      video.muted = false;
      muteBtn.addEventListener("click", () => {
        video.muted = !video.muted;
        if (video.muted) {
          muteBtn.classList.add("video-block__muted--active");
        } else {
          muteBtn.classList.remove("video-block__muted--active");
        }
      });
    }
  }
}
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
    }
  });
}, observerOptions);
document.querySelectorAll(".team__member").forEach((member) => {
  observer.observe(member);
});
document.querySelectorAll(".team__member").forEach((member) => {
  member.addEventListener("mousemove", (e) => {
    const rect = member.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    const photo = member.querySelector(".member-photo");
    photo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  });
  member.addEventListener("mouseleave", () => {
    const photo = member.querySelector(".member-photo");
    photo.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  });
  member.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  });
});
window.addEventListener("load", () => {
  const sectionTitle = document.querySelector(".section-title");
  if (sectionTitle) {
    sectionTitle.style.animationDelay = "0.2s";
  }
});
class Counter {
  constructor(element, targetValue, duration = 2e3) {
    this.element = element;
    this.targetValue = this.parseTargetValue(targetValue);
    this.duration = duration;
    this.hasAnimated = false;
  }
  // Парсимо значення (обробляємо + в кінці)
  parseTargetValue(value) {
    const cleanValue = value.toString().replace("+", "");
    return parseInt(cleanValue, 10);
  }
  // Анімація підрахунку з easing effect
  animate() {
    if (this.hasAnimated) return;
    this.hasAnimated = true;
    const startTime = performance.now();
    const startValue = 0;
    const originalText = this.element.textContent;
    const hasPlus = originalText.includes("+");
    this.element.classList.add("counting");
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(
        startValue + (this.targetValue - startValue) * easedProgress
      );
      this.element.textContent = hasPlus ? `${currentValue}+` : currentValue;
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        this.element.classList.remove("counting");
      }
    };
    requestAnimationFrame(updateCounter);
  }
}
function initScrollAnimation() {
  const animatedElements = document.querySelectorAll(
    ".fade-in, .slide-left, .slide-right"
  );
  const observer2 = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, index * 150);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px"
    }
  );
  animatedElements.forEach((element) => {
    observer2.observe(element);
  });
}
function initMissionCounters() {
  const counterElements = document.querySelectorAll(".facts__item-value");
  const counters = [];
  counterElements.forEach((element, index) => {
    const targetValue = element.textContent;
    const duration = 2500 + index * 300;
    counters.push(new Counter(element, targetValue, duration));
  });
  const observerOptions2 = {
    root: null,
    rootMargin: "0px 0px -100px 0px",
    threshold: 0.3
  };
  const observer2 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        counters.forEach((counter, index) => {
          setTimeout(() => {
            counter.animate();
          }, index * 200);
        });
        entry.target.classList.add("animate-counters");
        observer2.unobserve(entry.target);
      }
    });
  }, observerOptions2);
  const missionSection = document.querySelector(".mission");
  if (missionSection) {
    observer2.observe(missionSection);
  }
}
function initMissionHoverEffects() {
  const factsItems = document.querySelectorAll(".facts__item");
  const missionItems = document.querySelectorAll(".mission__item-right");
  factsItems.forEach((item) => {
    item.addEventListener("mouseenter", function() {
      this.classList.add("hovered");
    });
    item.addEventListener("mouseleave", function() {
      this.classList.remove("hovered");
    });
  });
  missionItems.forEach((item) => {
    item.addEventListener("mouseenter", function() {
      this.classList.add("hovered");
    });
    item.addEventListener("mouseleave", function() {
      this.classList.remove("hovered");
    });
  });
}
function initSmoothScroll() {
  const links = document.querySelectorAll("a[href]");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#") && href.length > 1) {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        try {
          const targetSection = document.querySelector(href);
          if (targetSection) {
            targetSection.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        } catch (error) {
          console.warn(`Cannot scroll to: ${href}`, error);
        }
      });
    }
  });
}
function restartMissionCounters() {
  const counterElements = document.querySelectorAll(".facts__item-value");
  counterElements.forEach((element, index) => {
    const targetValue = element.getAttribute("data-target") || element.textContent;
    const counter = new Counter(element, targetValue, 2e3);
    counter.hasAnimated = false;
    setTimeout(() => {
      counter.animate();
    }, index * 200);
  });
}
function initScrollAnimationFallback() {
  if ("IntersectionObserver" in window) return;
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
document.addEventListener("DOMContentLoaded", function() {
  initScrollAnimation();
  initMissionCounters();
  initMissionHoverEffects();
  initSmoothScroll();
  initScrollAnimationFallback();
  setTimeout(() => {
    document.body.classList.add("mission-loaded");
  }, 100);
});
window.MissionAnimation = {
  Counter,
  initMissionCounters,
  restartMissionCounters,
  initScrollAnimation,
  initMissionHoverEffects
};
