(function () {
    document.addEventListener('DOMContentLoaded', function () {
      var bouton = document.getElementById('btn-gps')
      if (!bouton) return
      var lat = document.getElementById('latitude')
      var lng = document.getElementById('longitude')
      var etat = document.getElementById('etat-gps')
  
      bouton.addEventListener('click', function () {
        if (!navigator.geolocation) {
          etat.textContent = "Position non disponible sur ce navigateur."
          return
        }
        etat.textContent = 'Recherche de votre position…'
        navigator.geolocation.getCurrentPosition(
          function (p) {
            lat.value = p.coords.latitude.toFixed(6)
            lng.value = p.coords.longitude.toFixed(6)
            etat.textContent = '✅ Position enregistrée (précision environ ' + Math.round(p.coords.accuracy) + ' m)'
          },
          function () {
            etat.textContent = "Position refusée ou indisponible. Autorisez la localisation dans le cadenas de la barre d'adresse."
          },
          { enableHighAccuracy: true, timeout: 15000 }
        )
      })
    })
  })()