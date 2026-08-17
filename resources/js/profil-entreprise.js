document.addEventListener('DOMContentLoaded', () => {
  // 1. Gestion de l'upload dynamique du logo de l'entreprise
  const logoInput = document.querySelector('#logo-input')
  
  if (logoInput) {
    logoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('avatar', file) // Champ géré par votre backend

      try {
        const response = await fetch('/profil/avatar', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })

        const data = await response.json()

        if (data.success) {
          // Met à jour instantanément toutes les images de logo sur la page
          const logoImages = document.querySelectorAll('.entreprise-logo')
          logoImages.forEach(img => {
            img.src = data.avatarUrl
          })
        } else {
          alert(data.message || 'Erreur lors de la mise à jour du logo')
        }
      } catch (error) {
        console.error('Erreur réseau :', error)
      }
    })
  }

  // 2. Gestion de la navigation par onglets du profil entreprise
  const tabs = document.querySelectorAll('.profile-tab')
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault()
      // Retire la classe active de tous les onglets
      tabs.forEach(t => t.classList.remove('active', 'text-green-700'))
      tabs.forEach(t => t.style.borderBottomColor = 'transparent')

      // Active l'onglet sélectionné
      e.currentTarget.classList.add('active', 'text-green-700')
    })
  })

  // 3. Gestion des boutons d'ajout au panier / commande de produits phares
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn')
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const productName = e.currentTarget.getAttribute('data-product')
      alert(`Produit "${productName}" ajouté aux commandes de l'entreprise avec succès !`)
    })
  })
})