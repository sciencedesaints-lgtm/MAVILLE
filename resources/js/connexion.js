/**
 * Page Connexion - MAVILLE
 */

document.addEventListener('DOMContentLoaded', () => {
    const formConnexion = document.getElementById('form-connexion')
    const togglePasswordBtn = document.getElementById('toggle-password-login')
    const passwordInput = document.getElementById('login-password')
  
    // 1. Afficher / Masquer le mot de passe
    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password'
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password')
        togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️'
      })
    }
  
    // 2. Soumission du formulaire de connexion -> Redirection directe Accueil
    if (formConnexion) {
      formConnexion.addEventListener('submit', async (e) => {
        e.preventDefault()
  
        const formData = new FormData(formConnexion)
        const payload = Object.fromEntries(formData.entries())
  
        try {
          const res = await window.apiFetch('/login', 'POST', payload)
  
          if (window.showToast) {
            window.showToast('Connexion réussie !', 'success')
          }
  
          // Stocker le token dans le localStorage
          const token = res.token?.token || res.token || 'session_active'
          localStorage.setItem('maville_token', token)
  
          // REDIRECTION DIRECTE VERS L'ACCUEIL
          window.location.href = '/accueil'
        } catch (err) {
          // L'erreur est gérée et affichée automatiquement par window.apiFetch via toast
        }
      })
    }
  })