const transition = document.getElementById("page-transition");
const glow = document.getElementById("cursor-glow");

/** Page Transition */
document.querySelectorAll("a[href]").forEach(link => {
  const url = link.getAttribute("href");

  if(url.startsWith("#")) return;
  if(url.startsWith("http")) return;
 
  link.addEventListener("click", function(e){
    e.preventDefault();
    transition.classList.add("active");
    const destination = this.href;

    setTimeout(()=>{
      window.location.href = destination;
    },1000);
  });
});

window.addEventListener("load", () => {
  const main = document.querySelector("main");

  setTimeout(()=>{
    main.classList.add("page-visible");
  },200);
});

document.querySelectorAll(".dropbtn, .social-links a").forEach(button => {
  button.addEventListener("mousemove", e => {

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width/2;
    const y = e.clientY - rect.top - rect.height/2;

    button.style.transform = `translate(${x*0.15}px, ${y*0.15}px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0,0)";
  });
});

document.addEventListener("mousemove", e => {

  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

/* 3D tilt for project cards */
document.querySelectorAll(".project-card").forEach(card => {

  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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