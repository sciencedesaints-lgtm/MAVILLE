/**
 * Dashboard / Page d'Accueil - MAVILLE
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // OUTIL : ouvrir la page de résultats
  // ==========================================
  function ouvrirResultats(texte) {
    const q = (texte || '').trim()
    if (!q) {
      if (window.showToast) window.showToast('Veuillez saisir un texte de recherche.', 'warning')
      return
    }
    window.location.href = '/resultats?q=' + encodeURIComponent(q)
  }

  // ==========================================
  // 1. GESTION DE LA SIDEBAR ET DU TOGGLE MOBILE
  // ==========================================
  const menuToggle = document.getElementById('menu-toggle')
  const sidebar = document.querySelector('.sidebar')

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed')
      sidebar.classList.toggle('open')
    })
  }

  // ==========================================
  // 2. RECHERCHE VOCALE (bouton de la fenêtre de recherche)
  // ==========================================
  function lancerRechercheVocale() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      if (window.showToast) window.showToast("La recherche vocale n'est pas supportée par ce navigateur.", 'error')
      else alert("La recherche vocale n'est pas supportée par ce navigateur.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    if (window.showToast) window.showToast('🎤 Écoute en cours... Parlez maintenant.', 'info')

    recognition.onresult = (event) => {
      const texteCapte = event.results[0][0].transcript
      if (window.showToast) window.showToast(`Texte capté : "${texteCapte}"`, 'success')
      ouvrirResultats(texteCapte)
    }

    recognition.onerror = (event) => {
      if (window.showToast) window.showToast(`Erreur micro : ${event.error}`, 'error')
    }

    recognition.start()
  }

  const btnVoice = document.getElementById('btn-choice-voice')
  if (btnVoice) {
    btnVoice.addEventListener('click', lancerRechercheVocale)
  }

  // ==========================================
  // 3. RECHERCHE PAR IMAGE (pas encore disponible côté serveur)
  // ==========================================
  const imageInput = document.querySelector('#image-search-exclusive-view input[type="file"]')
  if (imageInput) {
    imageInput.addEventListener('change', () => {
      if (imageInput.files && imageInput.files[0]) {
        if (window.showToast) window.showToast("La recherche par image arrive bientôt.", 'info')
        else alert('La recherche par image arrive bientôt.')
      }
    })
  }

  // ==========================================
  // 4. MASQUER / AFFICHER LE SOLDE DU COMPTE
  // ==========================================
  const eyeIcon = document.querySelector('.balance-title .eye-icon')
  const balanceAmount = document.querySelector('.balance-amount')

  if (eyeIcon && balanceAmount) {
    let isHidden = false
    const originalAmount = balanceAmount.textContent

    eyeIcon.addEventListener('click', () => {
      isHidden = !isHidden
      if (isHidden) {
        balanceAmount.textContent = '•••••••• FC'
        eyeIcon.textContent = '🙈'
      } else {
        balanceAmount.textContent = originalAmount
        eyeIcon.textContent = '👁️'
      }
    })
  }

  // ==========================================
  // 5. MENU DÉROULANT DU PROFIL
  // ==========================================
  const userMenuToggle = document.getElementById('user-menu-toggle')
  const userDropdown = document.getElementById('user-dropdown')

  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', (event) => {
      event.stopPropagation()
      userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block'
    })

    document.addEventListener('click', () => {
      if (userDropdown.style.display === 'block') {
        userDropdown.style.display = 'none'
      }
    })

    userDropdown.addEventListener('click', (event) => {
      event.stopPropagation()
    })
  }

  // ==========================================
  // 6. MENU DÉROULANT DE LOCALISATION (VILLE / PAYS)
  // ==========================================
  const locToggle = document.getElementById('location-menu-toggle')
  const locMenu = document.getElementById('location-dropdown-menu')
  const locText = document.getElementById('current-location-text')

  if (locToggle && locMenu) {
    locToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      locMenu.style.display = locMenu.style.display === 'block' ? 'none' : 'block'
    })

    document.querySelectorAll('.location-option').forEach((option) => {
      option.addEventListener('click', function () {
        const selectedValue = this.getAttribute('data-value')
        if (locText) locText.textContent = selectedValue
        locMenu.style.display = 'none'
        if (window.showToast) window.showToast(`Localisation modifiée : ${selectedValue}`, 'success')
      })
    })

    document.addEventListener('click', () => {
      locMenu.style.display = 'none'
    })

    locMenu.addEventListener('click', (event) => {
      event.stopPropagation()
    })
  }

  // ==========================================
  // 7. DONNÉES DYNAMIQUES DU DASHBOARD (si un token API existe)
  // ==========================================
  async function loadDashboardData() {
    try {
      const token = localStorage.getItem('maville_token')
      if (!token || !window.apiFetch) return

      const data = await window.apiFetch('/dashboard/summary', 'GET')

      if (data) {
        if (data.solde !== undefined && balanceAmount) {
          balanceAmount.textContent = `${data.solde.toLocaleString()} FC`
        }

        const notifBadge = document.querySelector('.notif-badge')
        if (notifBadge && data.unread_notifications !== undefined) {
          notifBadge.textContent = data.unread_notifications
        }
      }
    } catch (err) {
      console.warn('Impossible de charger les données temps réel du dashboard.')
    }
  }

  loadDashboardData()
})