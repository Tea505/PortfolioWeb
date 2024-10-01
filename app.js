document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

function openModal(id) {
    document.getElementById(id + '-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id + '-modal').style.display = 'none';
}
