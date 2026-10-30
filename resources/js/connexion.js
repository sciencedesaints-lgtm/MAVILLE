/**
 * Page Connexion - MAVILLE
 */

document.addEventListener('DOMContentLoaded', () => {
  const togglePasswordBtn = document.getElementById('toggle-password-login')
  const passwordInput = document.getElementById('login-password')

  // Afficher / Masquer le mot de passe
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password'
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password')
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️'
    })
  }
})