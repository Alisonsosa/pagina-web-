document.addEventListener('DOMContentLoaded', () => {
  // 1. Menú Hamburguesa para Móviles
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // 2. Buscador de Cursos en Tiempo Real
  const searchInput = document.getElementById('courseSearch');
  const courseCards = document.querySelectorAll('.course-card');

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    courseCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      const tag = card.querySelector('.course-tag').textContent.toLowerCase();

      // Muestra u oculta según si coincide la búsqueda
      if (title.includes(searchTerm) || description.includes(searchTerm) || tag.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
