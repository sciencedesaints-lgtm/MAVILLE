/**
 * Dashboard / Page d'Accueil - MAVILLE
 */

document.addEventListener('DOMContentLoaded', () => {

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
  // 2. HERO BANNER : ONGLETS DE RECHERCHE (TEXTE, VOCAL, IMAGE)
  // ==========================================
  const searchTabs = document.querySelectorAll('.hero-search-tabs .tab-btn')
  let typeRecherche = 'TEXTE' // 'TEXTE' | 'AUDIO' | 'IMAGE'
  let dernierAudioUrl = null
  let derniereImageUrl = null

  searchTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      searchTabs.forEach((btn) => btn.classList.remove('active'))
      tab.classList.add('active')

      const tabText = tab.textContent.trim()
      
      if (tabText.includes('Vocal') || tabText.includes('vocale')) {
        typeRecherche = 'AUDIO'
        lancerRechercheVocale()
      } else if (tabText.includes('Image') || tabText.includes('image')) {
        typeRecherche = 'IMAGE'
        lancerRechercheImage()
      } else {
        typeRecherche = 'TEXTE'
        const globalSearchInput = document.querySelector('.global-search-bar input')
        if (globalSearchInput) globalSearchInput.focus()
        if (window.showToast) window.showToast('Mode recherche textuelle activé', 'info')
      }
    })
  })

  // --- Logique Recherche Vocale (Micro) ---
  function lancerRechercheVocale() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      if (window.showToast) window.showToast('La recherche vocale n\'est pas supportée par votre navigateur.', 'error')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    if (window.showToast) window.showToast('🎤 Écoute en cours... Parlez maintenant.', 'info')

    recognition.start()

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      if (window.showToast) window.showToast(`Texte capté : "${speechResult}"`, 'success')
      
      const globalSearchInput = document.querySelector('.global-search-bar input')
      if (globalSearchInput) {
        globalSearchInput.value = speechResult
      }
      
      executerRechercheApi(speechResult, gpsLatitude, gpsLongitude)
    }

    recognition.onerror = (event) => {
      if (window.showToast) window.showToast(`Erreur micro : ${event.error}`, 'error')
    }
  }

  // --- Logique Recherche Image (Fichiers) ---
  function lancerRechercheImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        if (window.showToast) window.showToast(`📸 Image sélectionnée : ${file.name}`, 'success')
        derniereImageUrl = URL.createObjectURL(file)
        
        executerRechercheApi('Recherche par image', gpsLatitude, gpsLongitude)
      }
    }
    input.click()
  }

  // ==========================================
  // 3. HERO BANNER : FILTRES DE LOCALISATION (LIEUX)
  // ==========================================
  const filterBtns = document.querySelectorAll('.hero-filters .filter-btn')
  let scopeRecherche = 'AUTOUR_DE_MOI' // 'AUTOUR_DE_MOI' | 'VILLE' | 'AUTRE_VILLE' | 'MONDE'
  let gpsLatitude = null
  let gpsLongitude = null

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((f) => f.classList.remove('active'))
      btn.classList.add('active')

      const btnText = btn.textContent.trim()

      if (btnText.includes('Autour de moi')) {
        scopeRecherche = 'AUTOUR_DE_MOI'
        recupererGeolocalisation()
      } else if (btnText.includes('Toute la ville')) {
        scopeRecherche = 'VILLE'
        if (window.showToast) window.showToast('Portée : Toute la ville', 'info')
      } else if (btnText.includes('Autre ville')) {
        scopeRecherche = 'AUTRE_VILLE'
        if (window.showToast) window.showToast('Portée : Autre ville / pays', 'info')
      } else if (btnText.includes('Monde entier')) {
        scopeRecherche = 'MONDE'
        if (window.showToast) window.showToast('Portée : Monde entier', 'info')
      }
    })
  })

  function recupererGeolocalisation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          gpsLatitude = position.coords.latitude
          gpsLongitude = position.coords.longitude
          if (window.showToast) window.showToast('📍 Position GPS actualisée', 'success')
        },
        () => {
          if (window.showToast) window.showToast('Impossible de récupérer votre position GPS.', 'warning')
        }
      )
    }
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
  // 5. BARRE DE RECHERCHE GLOBALE & ENVOI API
  // ==========================================
  const globalSearchInput = document.querySelector('.global-search-bar input')
  const globalSearchBtn = document.querySelector('.global-search-bar .btn-search')

  function declencherRechercheTexte() {
    const query = globalSearchInput?.value.trim()
    if (!query) {
      if (window.showToast) window.showToast('Veuillez saisir un texte de recherche.', 'warning')
      return
    }
    executerRechercheApi(query, gpsLatitude, gpsLongitude)
  }

  async function executerRechercheApi(queryText, lat, lng) {
    if (window.showToast) window.showToast(`Recherche en cours...`, 'info')

    try {
      const response = await fetch('/api/v1/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: queryText,
          type_recherche: typeRecherche,
          audio_url: dernierAudioUrl,
          image_url: derniereImageUrl,
          scope_recherche: scopeRecherche,
          latitude: lat,
          longitude: lng,
          rayonKm: 1
        })
      })

      const result = await response.json()

      if (response.ok) {
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
        } else if (window.showToast) {
          window.showToast(result.reponseIa || 'Recherche effectuée avec succès !', 'success')
        }
      } else {
        if (window.showToast) window.showToast(result.message || 'Une erreur est survenue.', 'error')
      }
    } catch (err) {
      console.error('Erreur réseau :', err)
      if (window.showToast) window.showToast('Impossible de contacter le serveur.', 'error')
    }
  }

  if (globalSearchBtn) {
    globalSearchBtn.addEventListener('click', declencherRechercheTexte)
  }

  if (globalSearchInput) {
    globalSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        declencherRechercheTexte()
      }
    })
  }

  // ==========================================
  // 6. GESTION DU MENU DÉROULANT DU PROFIL
  // ==========================================
  const userMenuToggle = document.getElementById('user-menu-toggle');
  const userDropdown = document.getElementById('user-dropdown');

  if (userMenuToggle && userDropdown) {
      userMenuToggle.addEventListener('click', (event) => {
          event.stopPropagation();
          userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
      });

      document.addEventListener('click', () => {
          if (userDropdown.style.display === 'block') {
              userDropdown.style.display = 'none';
          }
      });

      userDropdown.addEventListener('click', (event) => {
          event.stopPropagation();
      });
  }

  // ==========================================
  // 7. CHARGEMENT DYNAMIQUE DES DONNÉES DU DASHBOARD
  // ==========================================
  async function loadDashboardData() {
    try {
      const token = localStorage.getItem('maville_token')
      if (!token) return

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