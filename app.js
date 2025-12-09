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

document.querySelectorAll('.imageRow').forEach(row => {
    row.style.display = 'flex';
    row.style.flexWrap = 'wrap';
    row.style.gap = '15px';
    row.style.marginTop = '10px';

    row.querySelectorAll('img').forEach(img => {
      img.style.width = 'auto';
      img.style.height = '60px';
      img.style.borderRadius = '8px';
      img.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      img.style.cursor = 'pointer';

      img.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.1)';
        img.style.opacity = '0.8';
      });

      img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
        img.style.opacity = '1';
      });
    });
  });

  const dropdownLinks = document.querySelectorAll('.dropdown-content a');
  const dropdown = document.querySelector('.dropdown');

  dropdownLinks.forEach(link => {
    link.addEventListener('click', () => {
      dropdown.classList.remove('active');
    });
  });

  // Optional: toggle menu on button click
  const dropbtn = document.querySelector('.dropbtn');
  dropbtn.addEventListener('click', () => {
    dropdown.classList.toggle('active');
  });