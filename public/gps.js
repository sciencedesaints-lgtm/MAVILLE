(function () {
  var PRECISION_MAX = 1000 // mètres

  function init() {
    var bouton = document.getElementById('btn-gps')
    var etat = document.getElementById('etat-gps')
    var lat = document.getElementById('latitude')
    var lng = document.getElementById('longitude')
    if (!bouton) return
    if (!etat || !lat || !lng) {
      alert('Le bloc de position est incomplet : il manque etat-gps, latitude ou longitude.')
      return
    }

    bouton.addEventListener('click', function (e) {
      e.preventDefault()
      lat.value = ''
      lng.value = ''
      etat.style.color = '#fbbf24'
      etat.textContent = '⏳ Recherche de votre position… (autorisez la localisation si le navigateur le demande)'

      if (!navigator.geolocation) {
        etat.style.color = '#f87171'
        etat.textContent = 'Position non disponible sur ce navigateur.'
        return
      }

      navigator.geolocation.getCurrentPosition(
        function (p) {
          var precision = Math.round(p.coords.accuracy)
          if (precision > PRECISION_MAX) {
            etat.style.color = '#f87171'
            etat.textContent =
              '⚠️ Position trop imprécise (' + precision + ' m) : elle n\'est pas enregistrée. ' +
              'Utilisez un téléphone avec le GPS activé, en extérieur. Votre offre sera quand même publiée, sans position.'
            return
          }
          lat.value = p.coords.latitude.toFixed(6)
          lng.value = p.coords.longitude.toFixed(6)
          etat.style.color = '#34d399'
          etat.textContent = '✅ Position enregistrée (précision environ ' + precision + ' m)'
        },
        function (err) {
          etat.style.color = '#f87171'
          etat.textContent =
            err.code === 1 ? "Position refusée : autorisez la localisation (cadenas de la barre d'adresse)."
            : err.code === 2 ? 'Position indisponible sur cet appareil.'
            : 'Délai dépassé : réessayez.'
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      )
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()