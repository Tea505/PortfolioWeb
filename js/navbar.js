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