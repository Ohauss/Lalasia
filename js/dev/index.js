import "./app.min.js";
import { e as elementChildren, c as createElement, m as makeElementsArray, a as elementParents, s as setInnerHTML, b as elementOuterSize, d as elementIndex, S as Swiper } from "./swiper-core.min.js";
import "./input.min.js";
import "./unimodal.min.js";
/* empty css         */
function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
  if (swiper.params.createElements) {
    Object.keys(checkProps).forEach((key) => {
      if (!params[key] && params.auto === true) {
        let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
        if (!element) {
          element = createElement("div", checkProps[key]);
          element.className = checkProps[key];
          swiper.el.append(element);
        }
        params[key] = element;
        originalParams[key] = element;
      }
    });
  }
  return params;
}
function Navigation(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  extendParams({
    navigation: {
      nextEl: null,
      prevEl: null,
      hideOnClick: false,
      disabledClass: "swiper-button-disabled",
      hiddenClass: "swiper-button-hidden",
      lockClass: "swiper-button-lock",
      navigationDisabledClass: "swiper-navigation-disabled"
    }
  });
  swiper.navigation = {
    nextEl: null,
    prevEl: null
  };
  function getEl(el) {
    let res;
    if (el && typeof el === "string" && swiper.isElement) {
      res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
      if (res) return res;
    }
    if (el) {
      if (typeof el === "string") res = [...document.querySelectorAll(el)];
      if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) {
        res = swiper.el.querySelector(el);
      } else if (res && res.length === 1) {
        res = res[0];
      }
    }
    if (el && !res) return el;
    return res;
  }
  function toggleEl(el, disabled) {
    const params = swiper.params.navigation;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (subEl) {
        subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
        if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
        if (swiper.params.watchOverflow && swiper.enabled) {
          subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
        }
      }
    });
  }
  function update() {
    const {
      nextEl,
      prevEl
    } = swiper.navigation;
    if (swiper.params.loop) {
      toggleEl(prevEl, false);
      toggleEl(nextEl, false);
      return;
    }
    toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
    toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
  }
  function onPrevClick(e) {
    e.preventDefault();
    if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slidePrev();
    emit("navigationPrev");
  }
  function onNextClick(e) {
    e.preventDefault();
    if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
    swiper.slideNext();
    emit("navigationNext");
  }
  function init() {
    const params = swiper.params.navigation;
    swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
      nextEl: "swiper-button-next",
      prevEl: "swiper-button-prev"
    });
    if (!(params.nextEl || params.prevEl)) return;
    let nextEl = getEl(params.nextEl);
    let prevEl = getEl(params.prevEl);
    Object.assign(swiper.navigation, {
      nextEl,
      prevEl
    });
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const initButton = (el, dir) => {
      if (el) {
        el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      }
      if (!swiper.enabled && el) {
        el.classList.add(...params.lockClass.split(" "));
      }
    };
    nextEl.forEach((el) => initButton(el, "next"));
    prevEl.forEach((el) => initButton(el, "prev"));
  }
  function destroy() {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const destroyButton = (el, dir) => {
      el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
    };
    nextEl.forEach((el) => destroyButton(el, "next"));
    prevEl.forEach((el) => destroyButton(el, "prev"));
  }
  on("init", () => {
    if (swiper.params.navigation.enabled === false) {
      disable();
    } else {
      init();
      update();
    }
  });
  on("toEdge fromEdge lock unlock", () => {
    update();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    if (swiper.enabled) {
      update();
      return;
    }
    [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.add(swiper.params.navigation.lockClass));
  });
  on("click", (_s, e) => {
    let {
      nextEl,
      prevEl
    } = swiper.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const targetEl = e.target;
    let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
    if (swiper.isElement && !targetIsButton) {
      const path = e.path || e.composedPath && e.composedPath();
      if (path) {
        targetIsButton = path.find((pathEl) => nextEl.includes(pathEl) || prevEl.includes(pathEl));
      }
    }
    if (swiper.params.navigation.hideOnClick && !targetIsButton) {
      if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
      let isHidden;
      if (nextEl.length) {
        isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      } else if (prevEl.length) {
        isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
      }
      if (isHidden === true) {
        emit("navigationShow");
      } else {
        emit("navigationHide");
      }
      [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.toggle(swiper.params.navigation.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
    init();
    update();
  };
  const disable = () => {
    swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
    destroy();
  };
  Object.assign(swiper.navigation, {
    enable,
    disable,
    update,
    init,
    destroy
  });
}
function classesToSelector(classes) {
  if (classes === void 0) {
    classes = "";
  }
  return `.${classes.trim().replace(/([\.:!+\/])/g, "\\$1").replace(/ /g, ".")}`;
}
function Pagination(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const pfx = "swiper-pagination";
  extendParams({
    pagination: {
      el: null,
      bulletElement: "span",
      clickable: false,
      hideOnClick: false,
      renderBullet: null,
      renderProgressbar: null,
      renderFraction: null,
      renderCustom: null,
      progressbarOpposite: false,
      type: "bullets",
      // 'bullets' or 'progressbar' or 'fraction' or 'custom'
      dynamicBullets: false,
      dynamicMainBullets: 1,
      formatFractionCurrent: (number) => number,
      formatFractionTotal: (number) => number,
      bulletClass: `${pfx}-bullet`,
      bulletActiveClass: `${pfx}-bullet-active`,
      modifierClass: `${pfx}-`,
      currentClass: `${pfx}-current`,
      totalClass: `${pfx}-total`,
      hiddenClass: `${pfx}-hidden`,
      progressbarFillClass: `${pfx}-progressbar-fill`,
      progressbarOppositeClass: `${pfx}-progressbar-opposite`,
      clickableClass: `${pfx}-clickable`,
      lockClass: `${pfx}-lock`,
      horizontalClass: `${pfx}-horizontal`,
      verticalClass: `${pfx}-vertical`,
      paginationDisabledClass: `${pfx}-disabled`
    }
  });
  swiper.pagination = {
    el: null,
    bullets: []
  };
  let bulletSize;
  let dynamicBulletIndex = 0;
  function isPaginationDisabled() {
    return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
  }
  function setSideBullets(bulletEl, position) {
    const {
      bulletActiveClass
    } = swiper.params.pagination;
    if (!bulletEl) return;
    bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
    if (bulletEl) {
      bulletEl.classList.add(`${bulletActiveClass}-${position}`);
      bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
      if (bulletEl) {
        bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
      }
    }
  }
  function getMoveDirection(prevIndex, nextIndex, length) {
    prevIndex = prevIndex % length;
    nextIndex = nextIndex % length;
    if (nextIndex === prevIndex + 1) {
      return "next";
    } else if (nextIndex === prevIndex - 1) {
      return "previous";
    }
    return;
  }
  function onBulletClick(e) {
    const bulletEl = e.target.closest(classesToSelector(swiper.params.pagination.bulletClass));
    if (!bulletEl) {
      return;
    }
    e.preventDefault();
    const index = elementIndex(bulletEl) * swiper.params.slidesPerGroup;
    if (swiper.params.loop) {
      if (swiper.realIndex === index) return;
      const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
      if (moveDirection === "next") {
        swiper.slideNext();
      } else if (moveDirection === "previous") {
        swiper.slidePrev();
      } else {
        swiper.slideToLoop(index);
      }
    } else {
      swiper.slideTo(index);
    }
  }
  function update() {
    const rtl = swiper.rtl;
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let current;
    let previousIndex;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
    const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
    if (swiper.params.loop) {
      previousIndex = swiper.previousRealIndex || 0;
      current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
    } else if (typeof swiper.snapIndex !== "undefined") {
      current = swiper.snapIndex;
      previousIndex = swiper.previousSnapIndex;
    } else {
      previousIndex = swiper.previousIndex || 0;
      current = swiper.activeIndex || 0;
    }
    if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
      const bullets = swiper.pagination.bullets;
      let firstIndex;
      let lastIndex;
      let midIndex;
      if (params.dynamicBullets) {
        bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height");
        el.forEach((subEl) => {
          subEl.style[swiper.isHorizontal() ? "width" : "height"] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
        });
        if (params.dynamicMainBullets > 1 && previousIndex !== void 0) {
          dynamicBulletIndex += current - (previousIndex || 0);
          if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
            dynamicBulletIndex = params.dynamicMainBullets - 1;
          } else if (dynamicBulletIndex < 0) {
            dynamicBulletIndex = 0;
          }
        }
        firstIndex = Math.max(current - dynamicBulletIndex, 0);
        lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
        midIndex = (lastIndex + firstIndex) / 2;
      }
      bullets.forEach((bulletEl) => {
        const classesToRemove = [...["", "-next", "-next-next", "-prev", "-prev-prev", "-main"].map((suffix) => `${params.bulletActiveClass}${suffix}`)].map((s) => typeof s === "string" && s.includes(" ") ? s.split(" ") : s).flat();
        bulletEl.classList.remove(...classesToRemove);
      });
      if (el.length > 1) {
        bullets.forEach((bullet) => {
          const bulletIndex = elementIndex(bullet);
          if (bulletIndex === current) {
            bullet.classList.add(...params.bulletActiveClass.split(" "));
          } else if (swiper.isElement) {
            bullet.setAttribute("part", "bullet");
          }
          if (params.dynamicBullets) {
            if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
              bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
            }
            if (bulletIndex === firstIndex) {
              setSideBullets(bullet, "prev");
            }
            if (bulletIndex === lastIndex) {
              setSideBullets(bullet, "next");
            }
          }
        });
      } else {
        const bullet = bullets[current];
        if (bullet) {
          bullet.classList.add(...params.bulletActiveClass.split(" "));
        }
        if (swiper.isElement) {
          bullets.forEach((bulletEl, bulletIndex) => {
            bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
          });
        }
        if (params.dynamicBullets) {
          const firstDisplayedBullet = bullets[firstIndex];
          const lastDisplayedBullet = bullets[lastIndex];
          for (let i = firstIndex; i <= lastIndex; i += 1) {
            if (bullets[i]) {
              bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
            }
          }
          setSideBullets(firstDisplayedBullet, "prev");
          setSideBullets(lastDisplayedBullet, "next");
        }
      }
      if (params.dynamicBullets) {
        const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
        const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
        const offsetProp = rtl ? "right" : "left";
        bullets.forEach((bullet) => {
          bullet.style[swiper.isHorizontal() ? offsetProp : "top"] = `${bulletsOffset}px`;
        });
      }
    }
    el.forEach((subEl, subElIndex) => {
      if (params.type === "fraction") {
        subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach((fractionEl) => {
          fractionEl.textContent = params.formatFractionCurrent(current + 1);
        });
        subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach((totalEl) => {
          totalEl.textContent = params.formatFractionTotal(total);
        });
      }
      if (params.type === "progressbar") {
        let progressbarDirection;
        if (params.progressbarOpposite) {
          progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal";
        } else {
          progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
        }
        const scale = (current + 1) / total;
        let scaleX = 1;
        let scaleY = 1;
        if (progressbarDirection === "horizontal") {
          scaleX = scale;
        } else {
          scaleY = scale;
        }
        subEl.querySelectorAll(classesToSelector(params.progressbarFillClass)).forEach((progressEl) => {
          progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
          progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
        });
      }
      if (params.type === "custom" && params.renderCustom) {
        setInnerHTML(subEl, params.renderCustom(swiper, current + 1, total));
        if (subElIndex === 0) emit("paginationRender", subEl);
      } else {
        if (subElIndex === 0) emit("paginationRender", subEl);
        emit("paginationUpdate", subEl);
      }
      if (swiper.params.watchOverflow && swiper.enabled) {
        subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
      }
    });
  }
  function render() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let paginationHTML = "";
    if (params.type === "bullets") {
      let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
      if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) {
        numberOfBullets = slidesLength;
      }
      for (let i = 0; i < numberOfBullets; i += 1) {
        if (params.renderBullet) {
          paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
        } else {
          paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
        }
      }
    }
    if (params.type === "fraction") {
      if (params.renderFraction) {
        paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
      } else {
        paginationHTML = `<span class="${params.currentClass}"></span> / <span class="${params.totalClass}"></span>`;
      }
    }
    if (params.type === "progressbar") {
      if (params.renderProgressbar) {
        paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
      } else {
        paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
      }
    }
    swiper.pagination.bullets = [];
    el.forEach((subEl) => {
      if (params.type !== "custom") {
        setInnerHTML(subEl, paginationHTML || "");
      }
      if (params.type === "bullets") {
        swiper.pagination.bullets.push(...subEl.querySelectorAll(classesToSelector(params.bulletClass)));
      }
    });
    if (params.type !== "custom") {
      emit("paginationRender", el[0]);
    }
  }
  function init() {
    swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
      el: "swiper-pagination"
    });
    const params = swiper.params.pagination;
    if (!params.el) return;
    let el;
    if (typeof params.el === "string" && swiper.isElement) {
      el = swiper.el.querySelector(params.el);
    }
    if (!el && typeof params.el === "string") {
      el = [...document.querySelectorAll(params.el)];
    }
    if (!el) {
      el = params.el;
    }
    if (!el || el.length === 0) return;
    if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
      el = [...swiper.el.querySelectorAll(params.el)];
      if (el.length > 1) {
        el = el.find((subEl) => {
          if (elementParents(subEl, ".swiper")[0] !== swiper.el) return false;
          return true;
        });
      }
    }
    if (Array.isArray(el) && el.length === 1) el = el[0];
    Object.assign(swiper.pagination, {
      el
    });
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (params.type === "bullets" && params.clickable) {
        subEl.classList.add(...(params.clickableClass || "").split(" "));
      }
      subEl.classList.add(params.modifierClass + params.type);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
      if (params.type === "bullets" && params.dynamicBullets) {
        subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
        dynamicBulletIndex = 0;
        if (params.dynamicMainBullets < 1) {
          params.dynamicMainBullets = 1;
        }
      }
      if (params.type === "progressbar" && params.progressbarOpposite) {
        subEl.classList.add(params.progressbarOppositeClass);
      }
      if (params.clickable) {
        subEl.addEventListener("click", onBulletClick);
      }
      if (!swiper.enabled) {
        subEl.classList.add(params.lockClass);
      }
    });
  }
  function destroy() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => {
        subEl.classList.remove(params.hiddenClass);
        subEl.classList.remove(params.modifierClass + params.type);
        subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        if (params.clickable) {
          subEl.classList.remove(...(params.clickableClass || "").split(" "));
          subEl.removeEventListener("click", onBulletClick);
        }
      });
    }
    if (swiper.pagination.bullets) swiper.pagination.bullets.forEach((subEl) => subEl.classList.remove(...params.bulletActiveClass.split(" ")));
  }
  on("changeDirection", () => {
    if (!swiper.pagination || !swiper.pagination.el) return;
    const params = swiper.params.pagination;
    let {
      el
    } = swiper.pagination;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      subEl.classList.remove(params.horizontalClass, params.verticalClass);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
    });
  });
  on("init", () => {
    if (swiper.params.pagination.enabled === false) {
      disable();
    } else {
      init();
      render();
      update();
    }
  });
  on("activeIndexChange", () => {
    if (typeof swiper.snapIndex === "undefined") {
      update();
    }
  });
  on("snapIndexChange", () => {
    update();
  });
  on("snapGridLengthChange", () => {
    render();
    update();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList[swiper.enabled ? "remove" : "add"](swiper.params.pagination.lockClass));
    }
  });
  on("lock unlock", () => {
    update();
  });
  on("click", (_s, e) => {
    const targetEl = e.target;
    const el = makeElementsArray(swiper.pagination.el);
    if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
      if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
      const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
      if (isHidden === true) {
        emit("paginationShow");
      } else {
        emit("paginationHide");
      }
      el.forEach((subEl) => subEl.classList.toggle(swiper.params.pagination.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass));
    }
    init();
    render();
    update();
  };
  const disable = () => {
    swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach((subEl) => subEl.classList.add(swiper.params.pagination.paginationDisabledClass));
    }
    destroy();
  };
  Object.assign(swiper.pagination, {
    enable,
    disable,
    render,
    update,
    init,
    destroy
  });
}
function toggleText(element) {
  console.log("toggleText викликано для елемента:", element);
  if (!element) {
    console.error("Елемент не передано в toggleText");
    return;
  }
  if (!element.classList.contains("expandable-text")) {
    console.warn("Елемент не має класу expandable-text, додаємо...");
    element.classList.add("expandable-text");
  }
  const isCollapsed = element.classList.contains("collapsed");
  console.log("Поточний стан collapsed:", isCollapsed);
  if (isCollapsed) {
    element.classList.remove("collapsed");
    element.classList.add("expanded");
    console.log("Текст розкрито");
  } else {
    element.classList.add("collapsed");
    element.classList.remove("expanded");
    console.log("Текст згорнуто");
  }
  console.log("Нові класи елемента:", element.className);
  element.setAttribute("aria-expanded", (!isCollapsed).toString());
  element.dispatchEvent(
    new CustomEvent("textToggled", {
      detail: {
        isExpanded: !isCollapsed,
        element
      }
    })
  );
}
function initializeExpandableText() {
  const expandableElements = document.querySelectorAll(".expandable-text");
  console.log(
    `Знайдено ${expandableElements.length} expandable-text елементів`
  );
  expandableElements.forEach((element, index) => {
    if (!element.classList.contains("expanded")) {
      element.classList.add("collapsed");
    }
    if (!element.hasAttribute("onclick")) {
      element.addEventListener("click", function() {
        toggleText(this);
      });
      console.log(`Додано обробник click для елемента ${index + 1}`);
    }
    element.setAttribute("tabindex", "0");
    element.setAttribute("role", "button");
    element.setAttribute(
      "aria-expanded",
      element.classList.contains("expanded").toString()
    );
    element.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleText(this);
      }
    });
  });
  return expandableElements.length;
}
function initializeExpandableTextBySelector(selector = ".articles-description") {
  const elements = document.querySelectorAll(selector);
  console.log(`Ініціалізація expandable text для селектора: ${selector}`);
  console.log(`Знайдено ${elements.length} елементів`);
  elements.forEach((element, index) => {
    if (!element.classList.contains("expandable-text")) {
      element.classList.add("expandable-text", "collapsed");
      element.classList.remove("expanded");
      console.log(`Ініціалізовано елемент ${index + 1}:`, {
        text: element.textContent.substring(0, 30) + "...",
        classes: element.className
      });
    }
  });
  return initializeExpandableText();
}
window.toggleText = toggleText;
window.initializeExpandableText = initializeExpandableText;
window.initializeExpandableTextBySelector = initializeExpandableTextBySelector;
function initIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    {
      threshold: 0
    }
  );
  document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
}
const sliderConfigs = {
  // Популярні товари
  popular: {
    selector: ".popular-section__items",
    config: {
      modules: [Navigation],
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      spaceBetween: 30,
      speed: 600,
      loop: false,
      grabCursor: true,
      watchOverflow: true,
      navigation: {
        prevEl: ".popular-section__items .swiper-button-prev",
        nextEl: ".popular-section__items .swiper-button-next",
        disabledClass: "swiper-button-disabled"
      },
      breakpoints: {
        568: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 25
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 30
        }
      },
      on: {
        init: function() {
          console.log("Popular слайдер ініціалізований");
          console.log("Кількість слайдів:", this.slides.length);
        },
        slideChange: function() {
          console.log("Popular - поточний слайд:", this.activeIndex);
        }
      }
    }
  },
  // Відгуки/Testimonials
  testimonials: {
    selector: ".testimonials-slider",
    config: {
      modules: [Navigation, Pagination],
      observer: true,
      observeParents: true,
      loop: false,
      // autoplay: {
      //   delay: 5000,
      //   disableOnInteraction: false,
      // },
      speed: 800,
      effect: "slide",
      slidesPerView: 1,
      spaceBetween: 30,
      centeredSlides: true,
      grabCursor: true,
      pagination: {
        el: ".testimonials-section .swiper-pagination",
        clickable: true,
        bulletClass: "swiper-pagination-bullet",
        bulletActiveClass: "swiper-pagination-bullet-active"
      },
      navigation: {
        nextEl: ".testimonials-section .swiper-button-next",
        prevEl: ".testimonials-section .swiper-button-prev",
        disabledClass: "swiper-button-disabled"
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
          centeredSlides: false
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
          centeredSlides: false
        }
      },
      on: {
        init: function() {
          console.log("Testimonials слайдер ініціалізований");
          initializeRatings();
        },
        slideChange: function() {
          console.log("Testimonials - поточний слайд:", this.activeIndex);
        }
      }
    }
  },
  // Articles з оновленою ініціалізацією expandable text
  articles: {
    selector: ".articles-slider",
    config: {
      modules: [Navigation, Pagination],
      observer: true,
      observeParents: true,
      loop: false,
      // autoplay: {
      //   delay: 5000,
      //   disableOnInteraction: false,
      // },
      speed: 800,
      effect: "slide",
      slidesPerView: 1,
      spaceBetween: 20,
      centeredSlides: false,
      grabCursor: true,
      // pagination: {
      //    el: ".articles-slider .swiper-pagination",
      //   clickable: true,
      //   bulletClass: "swiper-pagination-bullet",
      //   bulletActiveClass: "swiper-pagination-bullet-active",
      // },
      navigation: {
        nextEl: ".articles__body .swiper-button-next",
        prevEl: ".articles__body .swiper-button-prev",
        disabledClass: "swiper-button-disabled"
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 10
        },
        768: {
          slidesPerView: 1,
          spaceBetween: 10,
          centeredSlides: false
        },
        1024: {
          slidesPerView: 1,
          spaceBetween: 10,
          centeredSlides: false
        }
      },
      on: {
        init: function() {
          console.log("Articles слайдер ініціалізований");
          setTimeout(() => {
            initializeExpandableText();
            initializeExpandableTextBySelector(
              ".articles-description:not(.expandable-text)"
            );
          }, 100);
          const activeSlide = document.querySelector(".swiper-slide-active");
          if (activeSlide) {
            activeSlide.classList.add("in-view");
          }
        },
        slideChange: function() {
          console.log("Articles - поточний слайд:", this.activeIndex);
        },
        slideChangeTransitionStart: function() {
          document.querySelectorAll(".swiper-slide").forEach((slide) => {
            slide.classList.remove("in-view");
          });
        },
        slideChangeTransitionEnd: function() {
          const activeSlide = document.querySelector(".swiper-slide-active");
          if (activeSlide) {
            activeSlide.classList.add("in-view");
          }
          setTimeout(() => {
            initializeExpandableText();
            console.log(
              "Expandable text переініціалізовано після зміни слайду"
            );
          }, 100);
        }
      }
    }
  }
};
let activeSliders = [];
function initSliders() {
  Object.keys(sliderConfigs).forEach((sliderType) => {
    const { selector, config } = sliderConfigs[sliderType];
    const sliderElement = document.querySelector(selector);
    if (sliderElement) {
      try {
        const slider = new Swiper(selector, config);
        activeSliders.push({
          type: sliderType,
          instance: slider,
          element: sliderElement
        });
        console.log(`${sliderType} слайдер успішно ініціалізований`);
        handleSliderSpecificLogic(sliderType, slider);
      } catch (error) {
        console.error(`Помилка ініціалізації ${sliderType} слайдера:`, error);
      }
    } else {
      console.log(`${sliderType} слайдер не знайдено на сторінці`);
    }
  });
  console.log(`Всього ініціалізовано слайдерів: ${activeSliders.length}`);
  console.log(
    "Активні слайдери:",
    activeSliders.map((s) => s.type)
  );
}
function handleSliderSpecificLogic(sliderType, slider) {
  switch (sliderType) {
    case "testimonials":
      handleTestimonialsSlider(slider);
      break;
    case "popular":
      handlePopularSlider();
      break;
    case "hero":
      handleHeroSlider();
      break;
    case "articles":
      handleArticlesSlider(slider);
      break;
  }
}
function handleArticlesSlider(slider) {
  console.log("Articles слайдер налаштований з expandable-text системою");
  slider.on("transitionEnd", function() {
    setTimeout(() => {
      initializeExpandableText();
    }, 50);
  });
  document.addEventListener("textToggled", function(e) {
    console.log("Текст було перемкнуто в articles слайдері:", e.detail);
  });
}
function handleTestimonialsSlider(slider) {
  const swiperContainer = slider.el;
  swiperContainer.addEventListener("mouseenter", () => {
    if (slider.autoplay) {
      slider.autoplay.stop();
    }
  });
  swiperContainer.addEventListener("mouseleave", () => {
    if (slider.autoplay) {
      slider.autoplay.start();
    }
  });
  const slides = swiperContainer.querySelectorAll(".testimonials__slide");
  slides.forEach((slide) => {
    slide.addEventListener("mouseenter", function() {
      this.style.transform = "translateY(-5px) scale(1.02)";
    });
    slide.addEventListener("mouseleave", function() {
      this.style.transform = "translateY(0) scale(1)";
    });
  });
}
function handlePopularSlider(slider) {
  console.log("Popular слайдер налаштований");
}
function handleHeroSlider(slider) {
  console.log("Hero слайдер налаштований");
}
function initializeRatings() {
  document.querySelectorAll(".rating").forEach((rating) => {
    const ratingValue = rating.dataset.rating || "5.0";
    updateRatingDisplay(rating, parseFloat(ratingValue));
  });
  document.querySelectorAll(".rating__item").forEach((item) => {
    item.addEventListener("change", function() {
      const rating = this.closest(".rating");
      const value = parseFloat(this.value);
      updateRatingDisplay(rating, value);
      rating.dataset.rating = value.toFixed(1);
    });
  });
}
function updateRatingDisplay(ratingContainer, value) {
  const activeBar = ratingContainer.querySelector(".rating__active");
  const ratingValueElement = ratingContainer.querySelector(".rating__value");
  if (activeBar) {
    const widthPx = value / 5 * 100;
    activeBar.style.width = `${widthPx}px`;
  }
  if (ratingValueElement) {
    ratingValueElement.textContent = value.toFixed(1);
  }
}
function initGlobalKeyboardNavigation() {
  document.addEventListener("keydown", function(e) {
    const visibleSlider = activeSliders.find(({ element }) => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    if (visibleSlider && visibleSlider.instance) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        visibleSlider.instance.slidePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        visibleSlider.instance.slideNext();
      }
    }
  });
}
function destroyAllSliders() {
  activeSliders.forEach(({ instance, type }) => {
    if (instance && typeof instance.destroy === "function") {
      instance.destroy(true, true);
      console.log(`${type} слайдер знищено`);
    }
  });
  activeSliders = [];
}
function getSlider(type) {
  const found = activeSliders.find((slider) => slider.type === type);
  return found ? found.instance : null;
}
document.addEventListener("DOMContentLoaded", () => {
  const isProductPage = document.querySelector(".product-grid") || document.querySelector("#productItems") || document.querySelector(".product-grid__items") || window.location.pathname.includes("product.html");
  const hasSliders = document.querySelector(".popular-section__items") || document.querySelector(".testimonials-slider") || document.querySelector(".articles-slider") || document.querySelector("[data-fls-slider]");
  if (isProductPage) {
    console.log("🚫 Продуктова сторінка виявлена - слайдери пропущені");
    return;
  }
  if (!hasSliders) {
    console.log("ℹ️ Слайдери не знайдено на сторінці");
    return;
  }
  console.log("✅ Ініціалізація слайдерів...");
  initIntersectionObserver();
  console.log("Ініціалізація expandable text на сторінці...");
  setTimeout(() => {
    const initializedCount = initializeExpandableText();
    console.log(`Ініціалізовано ${initializedCount} expandable text елементів`);
    initializeExpandableTextBySelector(".articles-description");
  }, 200);
  initSliders();
  initGlobalKeyboardNavigation();
});
window.debugExpandableText = function() {
  const allElements = document.querySelectorAll(".expandable-text");
  console.log("=== DEBUG EXPANDABLE TEXT ===");
  console.log(`Всього expandable-text елементів: ${allElements.length}`);
  allElements.forEach((el, i) => {
    console.log(`Елемент ${i + 1}:`, {
      text: el.textContent.substring(0, 40) + "...",
      classes: el.className,
      isCollapsed: el.classList.contains("collapsed"),
      isExpanded: el.classList.contains("expanded"),
      hasOnClick: el.hasAttribute("onclick")
    });
  });
  if (allElements.length > 0) {
    console.log("Тестуємо перший елемент...");
    toggleText(allElements[0]);
  }
};
window.reinitExpandableText = function() {
  console.log("Повний перезапуск expandable text системи...");
  document.querySelectorAll(".expandable-text").forEach((el) => {
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
  });
  setTimeout(() => {
    const count = initializeExpandableText();
    console.log(`Переініціалізовано ${count} expandable text елементів`);
  }, 100);
};
window.sliderDebug = {
  activeSliders,
  getSlider,
  destroyAllSliders,
  initSliders,
  // Expandable text функції
  toggleText,
  initializeExpandableText,
  initializeExpandableTextBySelector,
  debugExpandableText: window.debugExpandableText,
  reinitExpandableText: window.reinitExpandableText
};
function formRating() {
  const ratings = document.querySelectorAll("[data-fls-rating]");
  if (ratings) {
    ratings.forEach((rating) => {
      const ratingValue = +rating.dataset.flsRatingValue;
      const ratingSize = +rating.dataset.flsRatingSize ? +rating.dataset.flsRatingSize : 5;
      const ratingType = rating.dataset.flsRating;
      formRatingInit(rating, ratingSize, ratingType);
      if (ratingValue) {
        formRatingSet(rating, ratingValue);
      }
      if (ratingType === "set") {
        document.addEventListener("click", formRatingAction);
      }
    });
  }
  function formRatingAction(e) {
    const targetElement = e.target;
    if (targetElement.closest(".rating__input")) {
      const currentElement = targetElement.closest(".rating__input");
      const ratingValue = +currentElement.value;
      const rating = currentElement.closest(".rating");
      const ratingSet = rating.dataset.flsRating === "set";
      ratingSet ? formRatingGet(rating, ratingValue) : null;
    }
  }
  function formRatingInit(rating, ratingSize, ratingType) {
    let ratingItems = ``;
    for (let index = 0; index < ratingSize; index++) {
      index === 0 ? ratingItems += `<div class="rating__items">` : null;
      if (ratingType === "set") {
        ratingItems += ` 
          <label class="rating__item"> 
            <input class="rating__input" type="radio" name="rating" value="${index + 1}"> 
          </label>`;
      } else {
        ratingItems += `<div class="rating__item"></div>`;
      }
      index === ratingSize - 1 ? ratingItems += `</div>` : null;
    }
    rating.insertAdjacentHTML("beforeend", ratingItems);
  }
  function formRatingGet(rating, ratingValue) {
    const resultRating = ratingValue;
    formRatingSet(rating, resultRating);
    updateRatingValue(rating, resultRating);
  }
  function formRatingSet(rating, value) {
    const ratingItems = rating.querySelectorAll(".rating__item");
    const resultFullItems = parseInt(value);
    const resultPartItem = value - resultFullItems;
    rating.hasAttribute("data-rating-title") ? rating.title = value : null;
    ratingItems.forEach((ratingItem, index) => {
      ratingItem.classList.remove("rating__item--active");
      ratingItem.querySelector("span") ? ratingItems[index].querySelector("span").remove() : null;
      if (index <= resultFullItems - 1) {
        ratingItem.classList.add("rating__item--active");
      }
      if (index === resultFullItems && resultPartItem) {
        ratingItem.insertAdjacentHTML(
          "beforeend",
          `<span style="width:${resultPartItem * 100}%"></span>`
        );
      }
    });
  }
  function updateRatingValue(rating, value) {
    let ratingValueElement = rating.nextElementSibling;
    if (!ratingValueElement || !ratingValueElement.classList.contains("rating__value")) {
      ratingValueElement = rating.parentElement.querySelector(".rating__value");
    }
    if (ratingValueElement) {
      ratingValueElement.textContent = value.toFixed(1);
    }
  }
}
document.querySelector("[data-fls-rating]") ? window.addEventListener("load", formRating) : null;
class Counter {
  constructor(element, targetValue, duration = 2e3) {
    this.element = element;
    this.targetValue = this.parseTargetValue(targetValue);
    this.duration = duration;
    this.hasAnimated = false;
    this.animationFrameId = null;
    this.element.setAttribute("data-target", targetValue);
  }
  // Парсимо значення (обробляємо + в кінці)
  parseTargetValue(value) {
    const cleanValue = value.toString().replace("+", "");
    const parsed = parseInt(cleanValue, 10);
    if (isNaN(parsed)) {
      console.warn(`Invalid target value: ${value}`);
      return 0;
    }
    return parsed;
  }
  // Анімація підрахунку з easing effect
  animate() {
    if (this.hasAnimated) return;
    this.hasAnimated = true;
    const startTime = performance.now();
    const startValue = 0;
    const originalText = this.element.getAttribute("data-target");
    const hasPlus = originalText.includes("+");
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(
        startValue + (this.targetValue - startValue) * easedProgress
      );
      this.element.textContent = hasPlus ? `${currentValue}+` : currentValue;
      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        cancelAnimationFrame(this.animationFrameId);
      }
    };
    this.animationFrameId = requestAnimationFrame(updateCounter);
  }
}
function initCounterAnimations() {
  const counterElements = document.querySelectorAll(".facts__item-value");
  if (!counterElements.length) {
    console.warn("No counter elements found with class .facts__item-value");
    return;
  }
  const counters = [];
  counterElements.forEach((element, index) => {
    const targetValue = element.textContent;
    const duration = 3e3 + index * 200;
    counters.push(new Counter(element, targetValue, duration));
  });
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(counterElements).indexOf(entry.target);
        setTimeout(() => {
          counters[index].animate();
        }, index * 150);
        entry.target.classList.add("animate-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  counterElements.forEach((element) => {
    observer.observe(element);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initCounterAnimations();
  if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    }
  }
});
