document.addEventListener('DOMContentLoaded', () => {

  // CONFIGURACIÓN DE ENDPOINTS DE BACKEND
  const ENDPOINTS = {
    LOGIN: "https://localhost:7248/api/Auth/Login",
    REGISTER: "https://localhost:7248/api/Auth/Register",
    FORGOT: "https://localhost:7248/api/Auth/ForgotPassword",
    GOOGLE: "https://localhost:7248/api/Auth/ExternalLogin/Google"
  };

  // Vistas / Formularios
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');
  
  // Elementos UI
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');
  const socialAuthGroup = document.getElementById('socialAuthGroup');
  const socialDivider = document.getElementById('socialDivider');
  const mensajeAuth = document.getElementById('mensajeAuth');
  const footerText = document.getElementById('footerText');

  // Enlaces de Conmutación
  const linkForgotPassword = document.getElementById('linkForgotPassword');
  
  // Botón OAuth Google
  const btnGoogleAuth = document.getElementById('btnGoogleAuth');

  // --- PROCESAR RETORNO DE GOOGLE OAUTH ---
  // Verifica si el backend devolvió el token en la URL (ej. login.html?token=XYZ&rol=estudiante)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenUrl = urlParams.get('token');
  const rolUrl = urlParams.get('rol') || 'estudiante';
  const errorUrl = urlParams.get('error');

  if (errorUrl) {
    mostrarMensaje('Error al autenticar con Google. Inténtalo de nuevo.', true);
  } else if (tokenUrl) {
    mostrarMensaje('¡Autenticación con Google exitosa! Redirigiendo...', false);
    guardarSesiónYRedireccionar({ token: tokenUrl }, rolUrl);
    return;
  }

  // 1. Mostrar / Ocultar Contraseñas
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '🙈' : '👁️';
    });
  });

  // 2. Conmutación entre Vistas (Login / Registro / Recuperación)
  function switchView(view) {
    mostrarMensaje('', false);
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    forgotForm.style.display = 'none';

    if (view === 'register') {
      authTitle.textContent = 'Crear una cuenta';
      authSubtitle.textContent = 'Únete a AprendeYa y comienza tus cursos';
      registerForm.style.display = 'block';
      socialAuthGroup.style.display = 'flex';
      socialDivider.style.display = 'flex';
      footerText.innerHTML = '¿Ya tienes cuenta? <a href="#" id="linkLogin">Inicia sesión aquí</a>';
      document.getElementById('linkLogin').addEventListener('click', (e) => { e.preventDefault(); switchView('login'); });
    } 
    else if (view === 'forgot') {
      authTitle.textContent = 'Recuperar contraseña';
      authSubtitle.textContent = 'Ingresa tu correo para enviarte instrucciones';
      forgotForm.style.display = 'block';
      socialAuthGroup.style.display = 'none';
      socialDivider.style.display = 'none';
      footerText.innerHTML = '<a href="#" id="linkLogin">Volver al inicio de sesión</a>';
      document.getElementById('linkLogin').addEventListener('click', (e) => { e.preventDefault(); switchView('login'); });
    } 
    else { // default 'login'
      authTitle.textContent = '¡Hola de nuevo!';
      authSubtitle.textContent = 'Ingresa tus credenciales para acceder a tus cursos';
      loginForm.style.display = 'block';
      socialAuthGroup.style.display = 'flex';
      socialDivider.style.display = 'flex';
      footerText.innerHTML = '¿Aún no tienes cuenta? <a href="#" id="linkRegister">Regístrate aquí</a>';
      document.getElementById('linkRegister').addEventListener('click', (e) => { e.preventDefault(); switchView('register'); });
    }
  }

  // Bindings iniciales
  if (linkForgotPassword) {
    linkForgotPassword.addEventListener('click', (e) => { e.preventDefault(); switchView('forgot'); });
  }
  switchView('login');

  // 3. Login Tradicional
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const role = document.getElementById('loginRole').value;
    const password = document.getElementById('loginPassword').value;
    const btnSubmit = loginForm.querySelector('button[type="submit"]');

    mostrarMensaje('', false);
    btnSubmit.disabled = true;

    try {
      const respuesta = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Rol: role, Password: password })
      });

      if (!respuesta.ok) {
        if (respuesta.status === 401) mostrarMensaje('Correo o contraseña incorrectos.', true);
        else mostrarMensaje(`Error del servidor (HTTP ${respuesta.status}).`, true);
        return;
      }

      const datos = await respuesta.json();
      guardarSesiónYRedireccionar(datos, role);

    } catch (error) {
      console.error('LOGIN ERROR', error);
      mostrarMensaje('No se pudo conectar con el servidor backend.', true);
    } finally {
      btnSubmit.disabled = false;
    }
  });

  // 4. Registro Nuevo Usuario
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;
    const btnSubmit = registerForm.querySelector('button[type="submit"]');

    mostrarMensaje('', false);
    btnSubmit.disabled = true;

    try {
      const respuesta = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nombre: nombre, Email: email, Rol: role, Password: password })
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        mostrarMensaje(errorData.message || 'No se pudo registrar el usuario.', true);
        return;
      }

      const datos = await respuesta.json();
      mostrarMensaje('¡Registro exitoso! Iniciando sesión...', false);
      setTimeout(() => guardarSesiónYRedireccionar(datos, role), 1000);

    } catch (error) {
      console.error('REGISTER ERROR', error);
      mostrarMensaje('Error de red al intentar registrar.', true);
    } finally {
      btnSubmit.disabled = false;
    }
  });

  // 5. Recuperación de Contraseña
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();
    const btnSubmit = forgotForm.querySelector('button[type="submit"]');

    mostrarMensaje('', false);
    btnSubmit.disabled = true;

    try {
      const respuesta = await fetch(ENDPOINTS.FORGOT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email })
      });

      if (respuesta.ok) {
        mostrarMensaje('Te hemos enviado un correo con las instrucciones de recuperación.', false);
      } else {
        mostrarMensaje('No se encontró una cuenta con ese correo.', true);
      }
    } catch (error) {
      mostrarMensaje('Error de conexión con el servidor.', true);
    } finally {
      btnSubmit.disabled = false;
    }
  });

  // 6. Integración Google OAuth
  if (btnGoogleAuth) {
    btnGoogleAuth.addEventListener('click', () => {
      // Redirige al endpoint de C# / ASP.NET Core que arranca el flujo de Google
      window.location.href = ENDPOINTS.GOOGLE;
    });
  }

  // Utilidades
  function guardarSesiónYRedireccionar(datos, rolSeleccionado) {
    if (datos.token) localStorage.setItem('token', datos.token);
    if (datos.usuario) localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    
    const rolFinal = datos.usuario?.rol || rolSeleccionado;

    if (rolFinal === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'estudiante.html';
    }
  }

  function mostrarMensaje(texto, esError) {
    if (!mensajeAuth) return;
    mensajeAuth.textContent = texto;
    mensajeAuth.style.display = texto ? 'block' : 'none';
    mensajeAuth.style.background = esError ? '#f8d7da' : '#d1e7dd';
    mensajeAuth.style.color = esError ? '#842029' : '#0f5132';
  }
});