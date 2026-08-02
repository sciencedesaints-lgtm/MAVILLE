/**
 * Page Inscription & Onboarding - MAVILLE
 */

document.addEventListener('DOMContentLoaded', () => {
    const sectionInscription = document.getElementById('section-inscription')
    const onboarding1 = document.getElementById('onboarding-1')
    const onboarding2 = document.getElementById('onboarding-2')
    const onboarding3 = document.getElementById('onboarding-3')
    const succesSection = document.getElementById('succes')
  
    const formInscription = document.getElementById('form-inscription')
    const togglePasswordBtn = document.getElementById('toggle-password-signup')
    const passwordInput = document.getElementById('signup-password')
  
    const btnOnboarding1 = document.getElementById('btn-onboarding-1')
    const btnOnboarding2 = document.getElementById('btn-onboarding-2')
    const btnOnboarding3 = document.getElementById('btn-onboarding-3')
  
    // Fonction utilitaire pour basculer la visibilité des cartes
    function switchStep(hideEl, showEl) {
      if (hideEl) {
        hideEl.classList.add('hidden')
        hideEl.classList.remove('active')
      }
      if (showEl) {
        showEl.classList.remove('hidden')
        showEl.classList.add('active')
      }
    }
  
    // 1. Afficher / Masquer le mot de passe
    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password'
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password')
        togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️'
      })
    }
  
    // 2. Soumission du formulaire d'inscription (Passe à l'Onboarding 1)
    if (formInscription) {
      formInscription.addEventListener('submit', async (e) => {
        e.preventDefault()
        const formData = new FormData(formInscription)
        const payload = Object.fromEntries(formData.entries())
  
        try {
          const res = await window.apiFetch('/register', 'POST', payload)
          
          if (window.showToast) {
            window.showToast('Compte créé avec succès !', 'success')
          }
  
          // Sauvegarde du Token dans le localStorage
          const token = res.token?.token || res.token || 'session_active'
          localStorage.setItem('maville_token', token)
  
          // Passage à la première étape d'Onboarding (Pas de redirection vers l'accueil ici)
          switchStep(sectionInscription, onboarding1)
        } catch (err) {
          // L'erreur est gérée et affichée automatiquement par window.apiFetch via toast
        }
      })
    }
  
    // 3. Navigation progressive dans le parcours Onboarding -> Succès
    if (btnOnboarding1) {
      btnOnboarding1.addEventListener('click', () => switchStep(onboarding1, onboarding2))
    }
  
    if (btnOnboarding2) {
      btnOnboarding2.addEventListener('click', () => switchStep(onboarding2, onboarding3))
    }
  
    if (btnOnboarding3) {
      btnOnboarding3.addEventListener('click', () => switchStep(onboarding3, succesSection))
    }
  })