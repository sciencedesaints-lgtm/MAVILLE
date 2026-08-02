/**
 * Page Authentification (Choix Connexion / Inscription) - MAVILLE
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnCreerCompte = document.getElementById('auth-creer-compte')
    const btnConnexion = document.getElementById('auth-connexion')
  
    // Redirection vers la création de compte
    if (btnCreerCompte) {
      btnCreerCompte.addEventListener('click', (e) => {
        const targetUrl = btnCreerCompte.getAttribute('href')
        if (targetUrl && targetUrl !== '#') {
          window.location.href = targetUrl
        }
      })
    }
  
    // Redirection vers la connexion
    if (btnConnexion) {
      btnConnexion.addEventListener('click', (e) => {
        const targetUrl = btnConnexion.getAttribute('href')
        if (targetUrl && targetUrl !== '#') {
          window.location.href = targetUrl
        }
      })
    }
  })