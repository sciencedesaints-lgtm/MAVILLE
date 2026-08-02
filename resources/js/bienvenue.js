/**
 * Page Bienvenue - MAVILLE
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Bouton "Continuer" vers la page d'authentification / connexion
    const btnContinuer = document.getElementById('btn-continuer-bienvenue')
  
    if (btnContinuer) {
      btnContinuer.addEventListener('click', (e) => {
        // Si c'est un bouton dans une navigation Adonis, on laisse le comportement de lien standard,
        // ou on redirige vers la route d'authentification
        const authUrl = btnContinuer.getAttribute('href')
        if (authUrl && authUrl !== '#') {
          window.location.href = authUrl
        }
      })
    }
  
    // 2. Redirection automatique si l'utilisateur a déjà un token actif
    const token = localStorage.getItem('maville_token')
    if (token) {
      // Rediriger directement vers l'accueil si une session existe
      const routeAccueil = btnContinuer?.dataset?.routeAccueil || '/accueil'
      // Desactivez cette redirection si vous préférez que l'utilisateur revoie la landing page
      // window.location.href = routeAccueil
    }
  })