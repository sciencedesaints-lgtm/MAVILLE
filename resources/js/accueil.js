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
    // 2. HERO BANNER : ONGLETS DE RECHERCHE
    // ==========================================
    const searchTabs = document.querySelectorAll('.hero-search-tabs .tab-btn')
  
    searchTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        searchTabs.forEach((btn) => btn.classList.remove('active'))
        tab.classList.add('active')
  
        const tabText = tab.textContent.trim()
        
        if (tabText.includes('Vocal') || tabText.includes('vocale')) {
          initVoiceSearch()
        } else if (tabText.includes('Image') || tabText.includes('image')) {
          initImageSearch()
        }
      })
    })
  
    function initVoiceSearch() {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        if (window.showToast) {
          window.showToast('Écoute en cours... Parlez maintenant.', 'info')
        }
      } else {
        if (window.showToast) {
          window.showToast('La recherche vocale n\'est pas supportée sur ce navigateur.', 'warning')
        }
      }
    }
  
    function initImageSearch() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file && window.showToast) {
          window.showToast(`Recherche par image : ${file.name}`, 'info')
        }
      }
      input.click()
    }
  
    // ==========================================
    // 3. HERO BANNER : FILTRES DE LOCALISATION
    // ==========================================
    const filterBtns = document.querySelectorAll('.hero-filters .filter-btn')
  
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((f) => f.classList.remove('active'))
        btn.classList.add('active')
      })
    })
  
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
    // 5. BARRE DE RECHERCHE GLOBALE
    // ==========================================
    const globalSearchInput = document.querySelector('.global-search-bar input')
    const globalSearchBtn = document.querySelector('.global-search-bar .btn-search')
  
    function triggerSearch() {
      const query = globalSearchInput?.value.trim()
      if (!query) return
  
      if (window.showToast) {
        window.showToast(`Recherche de "${query}"...`, 'info')
      }
      // Redirection possible vers la page de résultats
      // window.location.href = `/recherche?q=${encodeURIComponent(query)}`
    }
  
    if (globalSearchBtn) {
      globalSearchBtn.addEventListener('click', triggerSearch)
    }
  
    if (globalSearchInput) {
      globalSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          triggerSearch()
        }
      })
    }
  
    // ==========================================
    // 6. CHARGEMENT DYNAMIQUE DES DONNÉES DE L'ACCUEIL
    // ==========================================
    async function loadDashboardData() {
      try {
        const token = localStorage.getItem('maville_token')
        if (!token) return
  
        // Exemple d'appel API synchronisé avec window.apiFetch
        const data = await window.apiFetch('/dashboard/summary', 'GET')
  
        if (data) {
          // Mise à jour du solde si retourné par le backend
          if (data.solde !== undefined && balanceAmount) {
            balanceAmount.textContent = `${data.solde.toLocaleString()} FC`
          }
  
          // Mise à jour du badge de notifications si présent
          const notifBadge = document.querySelector('.notif-badge')
          if (notifBadge && data.unread_notifications !== undefined) {
            notifBadge.textContent = data.unread_notifications
          }
        }
      } catch (err) {
        // Les erreurs standard sont capturées silencieusement ou traitées par apiFetch
        console.warn('Impossible de charger les données temps réel du dashboard.')
      }
    }
  
    // Initialisation au chargement
    loadDashboardData()
  })