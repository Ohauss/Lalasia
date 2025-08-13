document.addEventListener("DOMContentLoaded", function() {
  const modal = document.getElementById("modalOverlay");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
  function detectModalType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("newsletter") || lowerText.includes("subscribe")) {
      return "newsletter";
    } else if (lowerText.includes("discount") || lowerText.includes("special")) {
      return "discount";
    } else if (lowerText.includes("work") || lowerText.includes("collaborate") || lowerText.includes("project")) {
      return "work";
    }
    return "general";
  }
  const modalData = {
    newsletter: {
      title: "Subscribe to Newsletter",
      subtitle: "Get the latest news and updates",
      submitText: "Subscribe",
      messagePlaceholder: "What topics interest you most?"
    },
    discount: {
      title: "Special Discount",
      subtitle: "Learn about our exclusive offers",
      submitText: "Get Discount",
      messagePlaceholder: "Tell us about your needs and interests..."
    },
    work: {
      title: "Work with Us",
      subtitle: "Let's discuss your project",
      submitText: "Send Request",
      messagePlaceholder: "Describe your project and how we can help..."
    },
    general: {
      title: "Get in Touch",
      subtitle: "We'd love to hear from you",
      submitText: "Send Message",
      messagePlaceholder: "Tell us how we can help you..."
    }
  };
  function openModal(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("Opening modal...");
    let modalType = "general";
    const clickedButton = event.target;
    const buttonText = clickedButton.textContent.toLowerCase();
    if (buttonText.includes("discount")) {
      modalType = "discount";
    } else {
      let contextText = "";
      const joinTitle = document.querySelector(".join__title h2");
      if (joinTitle) {
        contextText = joinTitle.textContent;
      } else {
        const productTitle = document.querySelector(".product__title");
        if (productTitle) {
          contextText = productTitle.textContent;
        }
      }
      if (contextText) {
        modalType = detectModalType(contextText);
      }
    }
    const data = modalData[modalType];
    document.getElementById("modalTitle").textContent = data.title;
    document.getElementById("modalSubtitle").textContent = data.subtitle;
    document.getElementById("submitBtn").textContent = data.submitText;
    document.getElementById("message").placeholder = data.messagePlaceholder;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    console.log("Modal opened, active class added");
    setTimeout(() => {
      const nameInput = document.getElementById("name");
      if (nameInput) {
        nameInput.focus();
      }
    }, 300);
  }
  function closeModal(event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    console.log("Closing modal...");
    modal.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
      const contactForm2 = document.getElementById("contactForm");
      if (contactForm2) {
        contactForm2.reset();
      }
    }, 300);
  }
  function initModalTriggers() {
    const modalTriggers = document.querySelectorAll(
      '[onclick*="openModal"], .discount-btn, .modal-trigger, [data-modal-trigger]'
    );
    modalTriggers.forEach((trigger) => {
      trigger.removeAttribute("onclick");
      trigger.addEventListener("click", openModal);
      console.log("Modal trigger initialized:", trigger);
    });
    const allButtons = document.querySelectorAll('button, .btn, a[href="#"]');
    allButtons.forEach((button) => {
      const buttonText = button.textContent.toLowerCase();
      if (buttonText.includes("discount") || buttonText.includes("contact") || buttonText.includes("get")) {
        button.removeAttribute("onclick");
        button.addEventListener("click", openModal);
        console.log("Auto-detected modal trigger:", button);
      }
    });
  }
  function initModalCloseTriggers() {
    if (modal) {
      modal.addEventListener("click", closeModal);
    }
    const closeButton = document.querySelector(
      ".modal__close, .close-modal, [data-modal-close]"
    );
    if (closeButton) {
      closeButton.addEventListener("click", function(e) {
        e.preventDefault();
        closeModal();
      });
    }
  }
  window.openModal = openModal;
  window.closeModal = closeModal;
  initModalTriggers();
  initModalCloseTriggers();
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      Object.fromEntries(formData);
      const submitBtn = document.getElementById("submitBtn");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      setTimeout(() => {
        alert(
          "Thank you! Your message has been sent. We'll get back to you soon."
        );
        closeModal();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1500);
    });
  }
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });
});
