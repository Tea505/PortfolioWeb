function scrollToElement(element, duration = 1000) { 
  const targetPosition = element.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
}



 const btn = document.getElementById("dropdownBtn");
  const dropdown = document.querySelector(".dropdown");
  const menu = document.querySelector(".dropdown-content");

  // Toggle dropdown open/close
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  // Close when clicking a menu item
  menu.querySelectorAll("a").forEach(item => {
    item.addEventListener("click", () => {
      dropdown.classList.remove("active");
    });
  });

  // Close when tapping outside
  document.addEventListener("click", () => {
    dropdown.classList.remove("active");
  });

  /* ------ MOBILE SWIPE CLOSE ------ */
  let startY = 0;

  // user touches screen
  document.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
  });

  // user swipes
  document.addEventListener("touchmove", (e) => {
    if (!dropdown.classList.contains("active")) return;

    const currentY = e.touches[0].clientY;
    const diffY = currentY - startY;

    if (Math.abs(diffY) > 25) {
      dropdown.classList.remove("active");
    }
  });