function openModal(id) {
    document.getElementById(id + '-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id + '-modal').style.display = 'none';
}

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

document.getElementById('activities').addEventListener('click', () => {
  const about = document.getElementById('activities-section');
  about.style.display = 'block';

  about.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('home').addEventListener('click', () => {
  const about = document.getElementById('activities-section');
  about.style.display = 'none';
});