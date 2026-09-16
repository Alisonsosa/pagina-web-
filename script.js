document.addEventListener('DOMContentLoaded', () => {

  // 1. Menú Hamburguesa para Móviles
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // 2. Buscador de Cursos
  const searchInput = document.getElementById('courseSearch');
  const courseCards = document.querySelectorAll('.course-card');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      courseCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const tag = card.querySelector('.course-tag').textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm) || tag.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // 3. Control de Estado de Sesión en Navbar
  const token = localStorage.getItem('token');
  const btnLogin = document.getElementById('btnLogin');
  const userProfileArea = document.getElementById('userProfileArea');
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  const btnLogout = document.getElementById('btnLogout');

  if (token) {
    // Usuario autenticado
    if (btnLogin) btnLogin.style.display = 'none';
    if (userProfileArea) userProfileArea.style.display = 'flex';

    // Recuperar datos de usuario guardados
    const usuarioStored = localStorage.getItem('usuario');
    if (usuarioStored) {
      const usuario = JSON.parse(usuarioStored);
      if (userNameEl) userNameEl.textContent = usuario.nombre || usuario.email || 'Usuario';
      if (userRoleEl) userRoleEl.textContent = usuario.rol || 'Estudiante';
    } else {
      if (userNameEl) userNameEl.textContent = 'Mi Cuenta';
      if (userRoleEl) userRoleEl.textContent = 'Estudiante';
    }
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.reload();
    });
  }

  // 4. Modal de Inscripción y Envíos de Formulario
  const modal = document.getElementById('modalInscripcion');
  const closeModal = document.getElementById('closeModal');
  const modalCourseTitle = document.getElementById('modalCourseTitle');
  const enrollCourseId = document.getElementById('enrollCourseId');
  const enrollmentForm = document.getElementById('enrollmentForm');
  const mensajeInscripcion = document.getElementById('mensajeInscripcion');

  // Abrir Modal al pulsar botones "Inscribirme"
  document.querySelectorAll('.btn-inscribir').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.course-card');
      const courseId = card ? card.getAttribute('data-course-id') : '0';
      const courseName = e.target.getAttribute('data-course-name') || 'Curso';

      if (modal) {
        modalCourseTitle.textContent = `Inscripción a: ${courseName}`;
        enrollCourseId.value = courseId;
        
        // Autocompletar si hay sesión activa
        const usuarioStored = localStorage.getItem('usuario');
        if (usuarioStored) {
          const usuario = JSON.parse(usuarioStored);
          document.getElementById('enrollName').value = usuario.nombre || '';
          document.getElementById('enrollEmail').value = usuario.email || '';
        }

        modal.style.display = 'block';
      }
    });
  });

  if (closeModal) {
    closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Envío del Formulario de Inscripción al Backend
  if (enrollmentForm) {
    enrollmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        CourseId: enrollCourseId.value,
        Nombre: document.getElementById('enrollName').value,
        Email: document.getElementById('enrollEmail').value
      };

      try {
        const respuesta = await fetch("https://localhost:7248/api/Inscripciones", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (respuesta.ok) {
          mensajeInscripcion.style.display = 'block';
          mensajeInscripcion.style.background = '#d1e7dd';
          mensajeInscripcion.style.color = '#0f5132';
          mensajeInscripcion.textContent = '¡Inscripción realizada con éxito!';
          setTimeout(() => { modal.style.display = 'none'; }, 2000);
        } else {
          throw new Error('Error al completar la inscripción');
        }
      } catch (err) {
        mensajeInscripcion.style.display = 'block';
        mensajeInscripcion.style.background = '#f8d7da';
        mensajeInscripcion.style.color = '#842029';
        mensajeInscripcion.textContent = 'No se pudo procesar la inscripción. Intenta de nuevo.';
      }
    });
  }
});