(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
function spollers() {
  const spollersArray = document.querySelectorAll("[data-fls-spollers]");
  if (spollersArray.length > 0) {
    let initSpollers2 = function(spollersArray2, matchMedia = false) {
      spollersArray2.forEach((spollersBlock) => {
        spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
        if (matchMedia.matches || !matchMedia) {
          spollersBlock.classList.add("--spoller-init");
          initSpollerBody2(spollersBlock);
        } else {
          spollersBlock.classList.remove("--spoller-init");
          initSpollerBody2(spollersBlock, false);
        }
      });
    }, initSpollerBody2 = function(spollersBlock, hideSpollerBody = true) {
      let spollerItems = spollersBlock.querySelectorAll("details");
      if (spollerItems.length) {
        spollerItems.forEach((spollerItem) => {
          let spollerTitle = spollerItem.querySelector("summary");
          if (hideSpollerBody) {
            spollerTitle.removeAttribute("tabindex");
            if (spollerItem.hasAttribute("data-fls-spollers-closed")) {
              spollerItem.open = false;
              spollerTitle.nextElementSibling.hidden = true;
            } else {
              spollerTitle.classList.add("--spoller-active");
              spollerItem.open = true;
            }
          } else {
            spollerTitle.setAttribute("tabindex", "-1");
            spollerTitle.classList.remove("--spoller-active");
            spollerItem.open = true;
            spollerTitle.nextElementSibling.hidden = false;
          }
        });
      }
    }, setSpollerAction2 = function(e) {
      const el = e.target;
      if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
        e.preventDefault();
        if (el.closest("[data-fls-spollers]").classList.contains("--spoller-init")) {
          const spollerTitle = el.closest("summary");
          const spollerBlock = spollerTitle.closest("details");
          const spollersBlock = spollerTitle.closest("[data-fls-spollers]");
          const oneSpoller = spollersBlock.hasAttribute(
            "data-fls-spollers-one"
          );
          const scrollSpoller = spollerBlock.hasAttribute(
            "data-fls-spollers-scroll"
          );
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          if (!spollersBlock.querySelectorAll(".--slide").length) {
            if (oneSpoller && !spollerBlock.open) {
              hideSpollersBody2(spollersBlock);
            }
            !spollerBlock.open ? spollerBlock.open = true : setTimeout(() => {
              spollerBlock.open = false;
            }, spollerSpeed);
            spollerTitle.classList.toggle("--spoller-active");
            slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
            if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
              const scrollSpollerValue = spollerBlock.dataset.flsSpollersScroll;
              const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
              const scrollSpollerNoHeader = spollerBlock.hasAttribute(
                "data-fls-spollers-scroll-noheader"
              ) ? document.querySelector(".header").offsetHeight : 0;
              window.scrollTo({
                top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
                behavior: "smooth"
              });
            }
          }
        }
      }
      if (!el.closest("[data-fls-spollers]")) {
        const spollersClose = document.querySelectorAll(
          "[data-fls-spollers-close]"
        );
        if (spollersClose.length) {
          spollersClose.forEach((spollerClose) => {
            const spollersBlock = spollerClose.closest("[data-fls-spollers]");
            const spollerCloseBlock = spollerClose.parentNode;
            if (spollersBlock.classList.contains("--spoller-init")) {
              const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
              spollerClose.classList.remove("--spoller-active");
              slideUp(spollerClose.nextElementSibling, spollerSpeed);
              setTimeout(() => {
                spollerCloseBlock.open = false;
              }, spollerSpeed);
            }
          });
        }
      }
    }, hideSpollersBody2 = function(spollersBlock) {
      const spollerActiveBlock = spollersBlock.querySelector("details[open]");
      if (spollerActiveBlock && !spollersBlock.querySelectorAll(".--slide").length) {
        const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
        const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
        spollerActiveTitle.classList.remove("--spoller-active");
        slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
        setTimeout(() => {
          spollerActiveBlock.open = false;
        }, spollerSpeed);
      }
    };
    var initSpollers = initSpollers2, initSpollerBody = initSpollerBody2, setSpollerAction = setSpollerAction2, hideSpollersBody = hideSpollersBody2;
    document.addEventListener("click", setSpollerAction2);
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
      return !item.dataset.flsSpollers.split(",")[0];
    });
    if (spollersRegular.length) {
      initSpollers2(spollersRegular);
    }
    let mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
}
window.addEventListener("load", spollers);
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
let cart = [];
let cartCount = 0;
const products = {
  "white-chair": {
    id: "white-chair",
    name: "White Aesthetic Chair",
    description: "Combination of wood and wool",
    price: 99.98,
    image: "/assets/img/White-chair/white-chair.jpg",
    colors: {
      black: "Black",
      charcoal: "Charcoal",
      goldenrod: "Goldenrod",
      silver: "Silver"
    }
  }
};
function initializeCart() {
  updateCartDisplay();
  updateCartCount();
}
function getSelectedColor() {
  const activeColorSwatch = document.querySelector(".color-swatch.active");
  if (activeColorSwatch) {
    const colorClasses = activeColorSwatch.className.split(" ");
    return colorClasses.find(
      (cls) => cls !== "color-swatch" && cls !== "active"
    );
  }
  return "black";
}
function getCurrentProduct() {
  const productSection = document.querySelector("[data-fls-white-chair]");
  if (productSection) {
    return products["white-chair"];
  }
  return null;
}
function updateCartCount() {
  const cartCountElements = document.querySelectorAll(
    "#cartCount, .cart-count"
  );
  cartCountElements.forEach((element) => {
    if (element) {
      element.textContent = cartCount;
    }
  });
}
function openSearch() {
  const searchModal = document.getElementById("searchModal");
  if (searchModal) {
    searchModal.style.display = "block";
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.focus();
    }
  }
}
function closeSearch() {
  const searchModal = document.getElementById("searchModal");
  if (searchModal) {
    searchModal.style.display = "none";
  }
}
function openCart() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.style.display = "block";
    updateCartDisplay();
  }
}
function closeCart() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.style.display = "none";
  }
}
function openProfile() {
  const profileModal = document.getElementById("profileModal");
  if (profileModal) {
    profileModal.style.display = "block";
  }
}
function closeProfile() {
  const profileModal = document.getElementById("profileModal");
  if (profileModal) {
    profileModal.style.display = "none";
  }
}
function buyNow() {
  const product = getCurrentProduct();
  if (!product) {
    alert("Product information not found!");
    return;
  }
  const selectedColor = getSelectedColor();
  const colorName = product.colors[selectedColor] || selectedColor;
  showBuyNowModal(product, selectedColor, colorName);
}
function showBuyNowModal(product, selectedColor, colorName) {
  let buyModal = document.getElementById("buyNowModal");
  if (!buyModal) {
    buyModal = document.createElement("div");
    buyModal.id = "buyNowModal";
    buyModal.className = "buy-modal";
    document.body.appendChild(buyModal);
  }
  const modalImage = document.getElementById("buyModalImage");
  const modalName = document.getElementById("buyModalName");
  const modalColor = document.getElementById("buyModalColor");
  const modalPrice = document.getElementById("buyModalPrice");
  const confirmBtn = document.getElementById("confirmBuyBtn");
  if (modalImage && modalName && modalColor && modalPrice && confirmBtn) {
    modalImage.src = product.image;
    modalImage.alt = product.name;
    modalName.textContent = product.name;
    modalColor.textContent = `Color: ${colorName}`;
    modalPrice.textContent = `$${product.price}`;
    confirmBtn.textContent = `Confirm purchase- $${product.price}`;
  }
  buyModal.classList.add("active");
}
function closeBuyNowModal() {
  const buyModal = document.getElementById("buyNowModal");
  if (buyModal) {
    buyModal.classList.remove("active");
  }
}
function processBuyNow(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const buyerName = formData.get("buyerName");
  const buyerPhone = formData.get("buyerPhone");
  const buyerAddress = formData.get("buyerAddress");
  alert(
    `Thanks for shopping with us!, ${buyerName}!

 We’ll deliver your order to the provided address:
${buyerAddress}

We will contact you at the number: ${buyerPhone}`
  );
  closeBuyNowModal();
}
function addToCart() {
  const product = getCurrentProduct();
  if (!product) {
    alert("We couldn’t find information about this product!");
    return;
  }
  const selectedColor = getSelectedColor();
  const colorName = product.colors[selectedColor] || selectedColor;
  const itemId = `${product.id}-${selectedColor}`;
  const existingItem = cart.find((item) => item.id === itemId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: itemId,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor,
      colorName,
      quantity: 1
    });
  }
  cartCount++;
  updateCartCount();
  alert(`${product.name} (${colorName}) You've added this item to your cart!`);
  updateCartDisplay();
}
function updateCartDisplay() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");
  if (!cartItemsContainer || !cartTotalElement) {
    console.warn("Cart items not found in the DOM");
    return;
  }
  let total = 0;
  let currentCartCount = 0;
  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <img src="/assets/img/empty-cart.svg" alt="Empty cart" class="empty-cart__icon">
        <p class="empty-cart__text">Your cart is empty</p>
        <p class="empty-cart__subtext">Add furniture to get started!</p>
      </div>
    `;
  } else {
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      currentCartCount += item.quantity;
      const cartItemDiv = document.createElement("div");
      cartItemDiv.classList.add("cart-item");
      cartItemDiv.innerHTML = `
        <div class="cart-item__image">
          <img src="${item.image}" alt="${item.name}" width="80" height="80">
        </div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__color">Color: ${item.colorName}</div>
          <div class="cart-item__price">$${item.price}</div>
        </div>
        <div class="cart-item__controls">
          <div class="quantity-controls">
            <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
          </div>
          <div class="cart-item__total">$${itemTotal.toFixed(2)}</div>
          <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Remove product from cart">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItemDiv);
    });
  }
  cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
  cartCount = currentCartCount;
  updateCartCount();
}
function changeQuantity(id, delta) {
  const itemIndex = cart.findIndex((item) => item.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
  }
  cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  updateCartDisplay();
}
function removeFromCart(id) {
  const itemIndex = cart.findIndex((item) => item.id === id);
  if (itemIndex > -1) {
    cartCount -= cart[itemIndex].quantity;
    cart.splice(itemIndex, 1);
  }
  updateCartDisplay();
}
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty. Add items to proceed with your order.");
    return;
  }
  const orderDetails = cart.map((item) => `${item.name} (${item.colorName}) x ${item.quantity}`).join("\n");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  alert(
    `Your order:
${orderDetails}

Order total: $${total.toFixed(
      2
    )}

Thanks for your order! Our team will be in touch soon.`
  );
  cart = [];
  cartCount = 0;
  updateCartDisplay();
  closeCart();
}
function clearCart() {
  cart = [];
  cartCount = 0;
  updateCartDisplay();
}
function navigateToAccount() {
  alert("Go to your account...\n(This would redirect to the account page)");
}
function showOrderHistory() {
  alert(
    "Order history:\n\n1. White Aesthetic Chair (Black) - $99.98\n   Status: Delivered\n   Date: 2024-01-15\n\n2. Modern Desk - $299.99\n   Status: In transit\n   Date: 2024-01-20"
  );
}
function showSettings() {
  alert(
    "Profile settings:\n\n• Change password\n• Update address\n• Notification settings\n• Language settings"
  );
}
function showWishlist() {
  alert(
    "Your wishlist:\n\n1. Modern Sofa Set - $899.99\n2. Coffee Table - $199.99\n3. Bookshelf - $149.99"
  );
}
function logout() {
  if (confirm("Are you sure you want to log out?")) {
    alert("You have successfully logged out.");
  }
}
window.openSearch = openSearch;
window.closeSearch = closeSearch;
window.openCart = openCart;
window.closeCart = closeCart;
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.closeBuyNowModal = closeBuyNowModal;
window.processBuyNow = processBuyNow;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.clearCart = clearCart;
window.navigateToAccount = navigateToAccount;
window.showOrderHistory = showOrderHistory;
window.showSettings = showSettings;
window.showWishlist = showWishlist;
window.logout = logout;
window.addEventListener("click", function(event) {
  const searchModal = document.getElementById("searchModal");
  const cartModal = document.getElementById("cartModal");
  const profileModal = document.getElementById("profileModal");
  if (event.target === searchModal) {
    closeSearch();
  }
  if (event.target === cartModal) {
    closeCart();
  }
  if (event.target === profileModal) {
    closeProfile();
  }
});
document.addEventListener("DOMContentLoaded", function() {
  console.log("Furniture store script loaded.");
  initializeCart();
  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", function() {
      document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
      this.classList.add("active");
    });
  });
  const buyNowButton = document.querySelector("[data-fls-button].buy-now");
  if (buyNowButton) {
    buyNowButton.addEventListener("click", buyNow);
  }
});
