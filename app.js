function openModal(id) {
    document.getElementById(id + '-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id + '-modal').style.display = 'none';
}

function loadAboutSection() {
  return fetch('externals/about.html')  
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.text();
    })
    .then(html => {
      document.getElementById('about-section').innerHTML = html;
    })
    .catch(error => {
      console.error('Failed to load external HTML:', error);
    });
}

const aboutLoaded = loadAboutSection();

window.addEventListener('DOMContentLoaded', () => {
  fetch('externals/about.html')  
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('about-section').innerHTML = html;
    })
    .catch(error => {
      console.error('Failed to load external HTML:', error);
    });
});
['home', 'about', 'projects', 'activities', 'skills', 'contact'].forEach(key => {
  const button = document.getElementById(`${key}Btn`);
  const section = document.getElementById(`${key}-section`);

  if (button && section) {
    button.addEventListener('click', () => scrollToElement(section, 800));
  }
});

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

