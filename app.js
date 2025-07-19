 document.querySelectorAll('.button-container button').forEach(button => {
            button.addEventListener('click', () => {
                console.log(`Clicked button with id: ${button.id}`);
                const targetId = button.id;
                const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
            
function openModal(id) {
    document.getElementById(id + '-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id + '-modal').style.display = 'none';
}
