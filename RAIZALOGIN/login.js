document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // CONFIGURACIÓN — ajusta esto a tu backend real
  // =========================================================
  const AUTH_URL = "https://localhost:7128/api/Auth/Login";
  const PAGINA_DESTINO = "dashboard.html"; // cambia esto por tu página principal real después del login

  const loginForm = document.getElementById('loginForm');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const mensajeError = document.getElementById('mensajeLogin');
  const btnSubmit = loginForm.querySelector('button[type="submit"]');

  // 1. Mostrar/Ocultar Contraseña
  togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.textContent = isPassword ? '🙈' : '👁️';
  });

  // 2. Envío del formulario contra el backend real (RAIZA)
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;

    mostrarMensaje('', false);
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Ingresando...';

    try {
      const respuesta = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password })
      });

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          mostrarMensaje('Correo o contraseña incorrectos.', true);
        } else if (respuesta.status === 400) {
          mostrarMensaje('Debes ingresar usuario y contraseña.', true);
        } else {
          mostrarMensaje(`Error del servidor (HTTP ${respuesta.status}).`, true);
        }
        return;
      }

      const datos = await respuesta.json();

      if (!datos.token) {
        mostrarMensaje('El servidor respondió sin token. Revisa el backend.', true);
        return;
      }

      localStorage.setItem('token', datos.token);
      window.location.href = PAGINA_DESTINO;

    } catch (error) {
      // Esto salta casi siempre por CORS o porque el backend no está corriendo
      console.error('LOGIN ERROR', error);
      mostrarMensaje(
        'No se pudo contactar al servidor. Verifica que el backend esté corriendo y tenga CORS habilitado.',
        true
      );
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Iniciar Sesión';
    }
  });

  function mostrarMensaje(texto, esError) {
    if (!mensajeError) return;
    mensajeError.textContent = texto;
    mensajeError.style.display = texto ? 'block' : 'none';
    mensajeError.classList.toggle('error', !!esError);
  }
});
