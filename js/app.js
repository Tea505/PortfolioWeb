const transition = document.getElementById("page-transition");
const transitionPlayer = document.getElementById("page-transition-player");
const glow = document.getElementById("cursor-glow");
const loader = document.getElementById("loader");

const PAGE_LINK_SELECTOR = ".dropdown-content .page-link[href]";
const TRANSITION_DURATION = 1200;
const CONTENT_SWAP_LEAD = 120;

const pageCache = new Map();
const pageRequests = new Map();
const prefetchHints = new Set();

const navigationEntry = performance.getEntriesByType("navigation")[0];
const navType = navigationEntry ? navigationEntry.type : "navigate";

let currentPageUrl = normalizePageUrl(window.location.href);
let isNavigating = false;

pageCache.set(currentPageUrl, createPageSnapshot(document, currentPageUrl));
history.replaceState({ url: currentPageUrl }, "", currentPageUrl);

handleLoader();
initializePageLinkNavigation();
initializeMagneticButtons();
initializeCursorGlow();
initializeProjectCards();

window.addEventListener("load", () => {
  revealMain(document.querySelector("main"));
  schedulePagePrefetch();
});

window.addEventListener("popstate", () => {
  const destination = normalizePageUrl(window.location.href);

  if (destination === currentPageUrl || isNavigating) {
    return;
  }

  navigateToPage(destination, { withTransition: false, pushState: false });
});

function handleLoader() {
  if (!loader) {
    return;
  }

  if (sessionStorage.getItem("visited") && navType !== "reload") {
    loader.style.display = "none";
    return;
  }

  sessionStorage.setItem("visited", "true");

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.style.opacity = "0";

      setTimeout(() => {
        loader.style.display = "none";
      }, 400);
    }, 2500);
  });
}

function normalizePageUrl(url) {
  const normalizedUrl = new URL(url, window.location.href);
  normalizedUrl.hash = "";

  return normalizedUrl.href;
}

function createPageSnapshot(doc, pageUrl) {
  const main = doc.querySelector("main");

  if (!main) {
    throw new Error(`Missing <main> for ${pageUrl}`);
  }

  const imageUrls = [...new Set(
    [...main.querySelectorAll("img[src]")]
      .map(image => image.getAttribute("src"))
      .filter(Boolean)
      .map(src => new URL(src, pageUrl).href)
  )];

  return {
    imageUrls,
    mainMarkup: main.outerHTML,
    title: doc.title,
    url: normalizePageUrl(pageUrl)
  };
}

function buildMainElement(mainMarkup) {
  const template = document.createElement("template");
  template.innerHTML = mainMarkup.trim();

  return template.content.firstElementChild;
}

function addPrefetchHint(url) {
  if (prefetchHints.has(url) || !document.head) {
    return;
  }

  const hint = document.createElement("link");
  hint.rel = "prefetch";
  hint.as = "document";
  hint.href = url;

  document.head.appendChild(hint);
  prefetchHints.add(url);
}

function preloadImage(url) {
  return new Promise(resolve => {
    const image = new Image();
    const finish = () => resolve(url);

    image.onload = finish;
    image.onerror = finish;
    image.decoding = "async";
    image.src = url;

    if (image.complete) {
      finish();
    }
  });
}

async function fetchPageData(pageUrl) {
  const response = await fetch(pageUrl, { credentials: "same-origin" });

  if (!response.ok) {
    throw new Error(`Failed to load ${pageUrl}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const pageData = createPageSnapshot(doc, pageUrl);

  await Promise.allSettled(pageData.imageUrls.map(preloadImage));

  pageCache.set(pageData.url, pageData);

  return pageData;
}

function getPageData(url) {
  const pageUrl = normalizePageUrl(url);

  if (pageCache.has(pageUrl)) {
    return Promise.resolve(pageCache.get(pageUrl));
  }

  if (!pageRequests.has(pageUrl)) {
    addPrefetchHint(pageUrl);

    const request = fetchPageData(pageUrl)
      .finally(() => {
        pageRequests.delete(pageUrl);
      });

    pageRequests.set(pageUrl, request);
  }

  return pageRequests.get(pageUrl);
}

function prefetchPage(url) {
  const destination = normalizePageUrl(url);

  if (destination === currentPageUrl || pageCache.has(destination)) {
    return;
  }

  getPageData(destination).catch(() => {
    prefetchHints.delete(destination);
  });
}

function schedulePagePrefetch() {
  const destinations = [...new Set(
    [...document.querySelectorAll(PAGE_LINK_SELECTOR)]
      .map(link => normalizePageUrl(link.href))
      .filter(url => url !== currentPageUrl)
  )];

  const runPrefetch = () => {
    destinations.forEach(prefetchPage);
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runPrefetch, { timeout: 1500 });
    return;
  }

  setTimeout(runPrefetch, 400);
}

function activateTransition() {
  if (transition) {
    transition.classList.add("active");
  }

  if (transitionPlayer) {
    transitionPlayer.stop?.();
    transitionPlayer.play?.();
  }
}

function deactivateTransition() {
  if (transition) {
    transition.classList.remove("active");
  }
}

function revealMain(main) {
  if (!main) {
    return;
  }

  requestAnimationFrame(() => {
    main.classList.add("page-visible");
  });
}

function renderPage(pageData, { pushState = true } = {}) {
  const currentMain = document.querySelector("main");
  const nextMain = buildMainElement(pageData.mainMarkup);

  if (!currentMain || !nextMain) {
    return false;
  }

  nextMain.classList.remove("page-visible");
  currentMain.replaceWith(nextMain);

  document.title = pageData.title;
  currentPageUrl = pageData.url;

  if (pushState) {
    history.pushState({ url: pageData.url }, "", pageData.url);
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  initializeProjectCards(nextMain);
  revealMain(nextMain);

  return true;
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function navigateToPage(destination, { withTransition = true, pushState = true } = {}) {
  const pageUrl = normalizePageUrl(destination);

  if (pageUrl === currentPageUrl || isNavigating) {
    return;
  }

  let fellBackToBrowserNavigation = false;
  isNavigating = true;

  if (withTransition) {
    activateTransition();
  }

  try {
    const minimumAnimationWait = withTransition
      ? delay(Math.max(0, TRANSITION_DURATION - CONTENT_SWAP_LEAD))
      : Promise.resolve();

    const [pageData] = await Promise.all([
      getPageData(pageUrl),
      minimumAnimationWait
    ]);

    if (!renderPage(pageData, { pushState })) {
      fellBackToBrowserNavigation = true;
      window.location.href = pageUrl;
      return;
    }

    if (withTransition) {
      await delay(CONTENT_SWAP_LEAD);
    }
  } catch (error) {
    fellBackToBrowserNavigation = true;
    window.location.href = pageUrl;
    return;
  } finally {
    if (withTransition && !fellBackToBrowserNavigation) {
      deactivateTransition();
    }

    isNavigating = false;
  }
}

function initializePageLinkNavigation() {
  document.querySelectorAll(PAGE_LINK_SELECTOR).forEach(link => {
    if (link.dataset.transitionBound === "true") {
      return;
    }

    link.dataset.transitionBound = "true";

    const warmPage = () => {
      prefetchPage(link.href);
    };

    link.addEventListener("mouseenter", warmPage);
    link.addEventListener("focus", warmPage);
    link.addEventListener("touchstart", warmPage, { passive: true });

    link.addEventListener("click", event => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const destination = normalizePageUrl(link.href);

      if (destination === currentPageUrl) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      navigateToPage(destination);
    });
  });
}

function initializeMagneticButtons() {
  document.querySelectorAll(".dropbtn, .social-links a").forEach(button => {
    if (button.dataset.magneticBound === "true") {
      return;
    }

    button.dataset.magneticBound = "true";

    button.addEventListener("mousemove", event => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translate(0,0)";
    });
  });
}

function initializeCursorGlow() {
  if (!glow) {
    return;
  }

  document.addEventListener("mousemove", event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

function initializeProjectCards(scope = document) {
  scope.querySelectorAll(".project-card").forEach(card => {
    if (card.dataset.tiltBound === "true") {
      return;
    }

    card.dataset.tiltBound = "true";

    card.addEventListener("mousemove", event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -(y - centerY) / 18;
      const rotateY = (x - centerX) / 18;

      card.style.transform =
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0) rotateY(0)";
    });
  });
}
