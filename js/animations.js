/* main screen glitches */
const targets = "#Tauha, #student";

function glitchText() { 
    const tl = gsap.timeline({
    onComplete: () => {
      gsap.delayedCall(gsap.utils.random(0, 2), glitchText);
    }
  });

  tl.to(targets, {
    duration: 0.07,
    x: () => gsap.utils.random(-6, 6),
    y: () => gsap.utils.random(-4, 4),
    skewX: () => gsap.utils.random(-15, 15),
    textShadow: () => `
      ${gsap.utils.random(-8, 8)}px ${gsap.utils.random(-8, 8)}px 0px #ff007f, 
      ${gsap.utils.random(-8, 8)}px ${gsap.utils.random(-8, 8)}px 0px #00ffcc
    `,
  })
  .to(targets, {
    duration: 0.06,
    x: () => gsap.utils.random(-8, 8),
    y: () => gsap.utils.random(-3, 3),
    skewX: () => gsap.utils.random(-10, 10),
    textShadow: () => `
      ${gsap.utils.random(-10, 10)}px ${gsap.utils.random(-6, 6)}px 0px #00ffcc, 
      ${gsap.utils.random(-10, 10)}px ${gsap.utils.random(-6, 6)}px 0px #ff007f
    `,
  })
  .to(targets, {
    duration: 0.04,
    x: 0,
    textShadow: "10px 0px 0px #ff007f, -10px 0px 0px #00ffcc"
  })
  .to(targets, {
    duration: 0.07,
    x: 0,
    y: 0,
    skewX: 0,
    textShadow: "4px 4px 0px #ff007f, -4px -4px 0px #00ffcc",
    ease: "power4.out"
  });
}

window.addEventListener("DOMContentLoaded", () => {
  gsap.delayedCall(1, glitchText);
});