const btn = document.getElementById("dropdownBtn");
const dropdown = document.querySelector(".dropdown");
const menu = document.querySelector(".dropdown-content");

btn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("active");
});

menu.querySelectorAll("a").forEach(item => {
  item.addEventListener("click", () => {
    dropdown.classList.remove("active");
  });
});

document.addEventListener("click", () => {
  dropdown.classList.remove("active");
});

/* ------ close on mobile swipe ------ */
let startY = 0;
document.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

document.addEventListener("touchmove", (e) => {
  if (!dropdown.classList.contains("active")) return;

  const currentY = e.touches[0].clientY;
  const diffY = currentY - startY;

  if (Math.abs(diffY) > 25) {
    dropdown.classList.remove("active");
  }
});
