/**
 * Application Frontend MAVILLE - Connexion API AdonisJS v6
 */

const API_BASE_URL = window.location.origin // Utilise l'origine courante ou 'http://localhost:3333'

document.addEventListener('DOMContentLoaded', () => {
  // 1. Éléments DOM principaux (Sécurisés)
  const views = document.querySelectorAll('section[id], .app-card, .form-container, .app-viewport')
  const toastContainer = document.getElementById('toast-container')
  const shopsContainer = document.getElementById('shops-container')

  // 2. Gestion de l'affichage des pages (Prise en compte des formulaires, cartes et onboarding)
  function afficherPage(idCible) {
    views.forEach((view) => {
      // Nettoyage de la classe active
      view.classList.remove('active')

      // Vérification par ID complet (ex: 'section-connexion' ou 'connexion')
      const targetId = idCible.startsWith('section-') ? idCible : `section-${idCible}`

      if (view.id === idCible || view.id === targetId) {
        view.classList.add('active')
        if (idCible === 'accueil' || idCible === 'section-accueil') {
          view.style.display = 'flex'
          view.style.flexDirection = 'column'
        } else {
          view.style.display = 'block'
        }
      } else {
        view.style.display = 'none'
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 3. Notification Toast
  function showToast(message, type = 'error') {
    if (!toastContainer) return
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    toastContainer.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  }

  // 4. Client API HTTP Centralisé
  async function apiFetch(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('maville_token')
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config = { method, headers }
    if (body) config.body = JSON.stringify(body)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Une erreur est survenue')
      }
      return data
    } catch (error) {
      showToast(error.message, 'error')
      throw error
    }
  }

  // 5. Événements de Navigation Principaux
  document
    .getElementById('btn-continuer-bienvenue')
    ?.addEventListener('click', () => afficherPage('authentification'))
  document
    .getElementById('auth-creer-compte')
    ?.addEventListener('click', () => afficherPage('inscription'))
  document
    .getElementById('auth-connexion')
    ?.addEventListener('click', () => afficherPage('connexion'))
  document
    .getElementById('link-connexion')
    ?.addEventListener('click', () => afficherPage('connexion'))

  // Navigation du parcours ONBOARDING
  document
    .getElementById('btn-onboarding-1')
    ?.addEventListener('click', () => afficherPage('onboarding-2'))
  document
    .getElementById('btn-onboarding-2')
    ?.addEventListener('click', () => afficherPage('onboarding-3'))
  document
    .getElementById('btn-onboarding-3')
    ?.addEventListener('click', () => afficherPage('succes'))
  
  // Validation finale depuis la page succès -> Accueil
  document
    .getElementById('btn-vers-accueil')
    ?.addEventListener('click', (e) => {
      e.preventDefault()
      chargerEtablissements()
      afficherPage('accueil')
    })

  // Toggle Masquer/Afficher mot de passe
  const setupToggle = (btnId, inputId) => {
    const btn = document.getElementById(btnId)
    const input = document.getElementById(inputId)
    if (btn && input) {
      btn.addEventListener('click', () => {
        const isPassword = input.type === 'password'
        input.type = isPassword ? 'text' : 'password'
        btn.textContent = isPassword ? '🙈' : '👁️'
      })
    }
  }
  setupToggle('toggle-password-signup', 'signup-password')
  setupToggle('toggle-password-login', 'login-password')

  // 6. SOUMISSION : INSCRIPTION
  document.getElementById('form-inscription')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())

    try {
      const res = await apiFetch('/register', 'POST', payload)
      showToast('Compte créé avec succès !', 'success')

      // 1. On sauvegarde le fait que l'utilisateur est connecté
      localStorage.setItem('maville_token', res.token?.token || res.token || 'session_active')

      // 2. CHOIX DU PARCOURS :
      
      // OPTION A : Si vous voulez lancer les 3 étapes d'Onboarding
      afficherPage('onboarding-1')

      // OPTION B : Si vous voulez aller DIRECTEMENT sur la page d'Accueil
      // (Si vous préférez l'Option B, effacez la ligne Option A et décommentez les 2 lignes ci-dessous) :
      // chargerEtablissements()
      // afficherPage('accueil')

    } catch (err) {
      // En cas d'erreur, le toast l'affiche automatiquement
    }
  })

  // 7. SOUMISSION : CONNEXION
  document.getElementById('form-connexion')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())

    try {
      const res = await apiFetch('/login', 'POST', payload)
      showToast('Connexion réussie !', 'success')

      // Stocker le Token
      localStorage.setItem('maville_token', res.token?.token || res.token)
      chargerEtablissements()
      afficherPage('accueil')
    } catch (err) {
      // Erreur affichée via toast
    }
  })

  // 8. DÉCONNEXION
  document.getElementById('btn-logout')?.addEventListener('click', (e) => {
    e.preventDefault()
    localStorage.removeItem('maville_token')
    showToast('Déconnecté', 'success')
    afficherPage('authentification')
  })

  // 9. CHARGEMENT DYNAMIQUE DES ÉTABLISSEMENTS DEPUIS L'API
  async function chargerEtablissements() {
    if (!shopsContainer) return
    try {
      shopsContainer.innerHTML = '<p>Chargement des boutiques...</p>'
      const etablissements = await apiFetch('/etablissements', 'GET')

      if (!etablissements || etablissements.length === 0) {
        shopsContainer.innerHTML = '<p>Aucun établissement disponible pour le moment.</p>'
        return
      }

      shopsContainer.innerHTML = etablissements
        .map(
          (shop) => `
          <article class="shop-card">
              <div class="card-image-box">
                  <img src="${shop.image || 'supermarche.jpg'}" alt="${shop.nom}">
              </div>
              <div class="card-details">
                  <h3>${shop.nom}</h3>
                  <p class="card-subtitle">${shop.categorie || 'Commerce'}</p>
                  <button class="btn-card-action">Voir Rayons</button>
              </div>
          </article>
      `
        )
        .join('')
    } catch (err) {
      shopsContainer.innerHTML = '<p>Impossible de charger les données.</p>'
    }
  }

  // 10. MENU BURGER RESPONSIVE
  const burgerBtn = document.getElementById('burger-btn')
  const navMenu = document.getElementById('nav-menu')
  const menuOverlay = document.getElementById('menu-overlay')
  const navLinks = document.querySelectorAll('.nav-menu a')

  function toggleMenu() {
    if (!burgerBtn || !navMenu) return
    burgerBtn.classList.toggle('is-active')
    navMenu.classList.toggle('is-active')
    menuOverlay?.classList.toggle('is-active')
    document.body.style.overflow = navMenu.classList.contains('is-active') ? 'hidden' : ''
  }

  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener('click', toggleMenu)
    menuOverlay?.addEventListener('click', toggleMenu)

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('is-active')) {
          toggleMenu()
        }
      })
    })
  }

  // 11. INITIALISATION AU DÉMARRAGE
  const tokenExistant = localStorage.getItem('maville_token')
  if (tokenExistant) {
    chargerEtablissements()
    afficherPage('accueil')
  } else {
    afficherPage('bienvenue')
  }
})