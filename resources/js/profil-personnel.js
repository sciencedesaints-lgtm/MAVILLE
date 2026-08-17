document.addEventListener('DOMContentLoaded', () => {
  const avatarInput = document.querySelector('#avatar-input')
  
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('avatar', file)

      try {
        const response = await fetch('/profil/avatar', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
            // Ajoutez votre token CSRF ici si nécessaire selon votre configuration AdonisJS
          }
        })

        const data = await response.json()

        if (data.success) {
          // Met à jour l'image affichée à l'écran instantanément (.profile-avatar-wrapper img et .post-avatar)
          const avatarImages = document.querySelectorAll('.profile-avatar-wrapper img, .post-avatar')
          avatarImages.forEach(img => {
            img.src = data.avatarUrl
          })
        } else {
          alert(data.message || 'Erreur lors de la mise à jour de l’avatar')
        }
      } catch (error) {
        console.error('Erreur réseau:', error)
      }
    })
  }
})