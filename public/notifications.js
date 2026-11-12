(function () {
    let ctx = null
  
    // Les navigateurs exigent un geste de l'utilisateur avant de jouer un son
    function debloquer() {
      if (!ctx) {
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)()
        } catch (e) {}
      }
      if (ctx && ctx.state === 'suspended') ctx.resume()
    }
    document.addEventListener('click', debloquer)
    document.addEventListener('keydown', debloquer)
  
    function bip() {
      if (!ctx) return
      const t = ctx.currentTime
      ;[880, 1175].forEach((freq, i) => {
        const debut = t + i * 0.18
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, debut)
        gain.gain.exponentialRampToValueAtTime(0.25, debut + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, debut + 0.16)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(debut)
        osc.stop(debut + 0.17)
      })
    }
  
    function afficher(n) {
      document.querySelectorAll('[data-notif-badge]').forEach((el) => {
        el.textContent = n > 99 ? '99+' : String(n)
        el.style.display = n > 0 ? 'inline-block' : 'none'
      })
    }
  
    function lireDernier() {
      try {
        const v = sessionStorage.getItem('notif_dernier')
        return v === null ? null : Number(v)
      } catch (e) {
        return null
      }
    }
  
    function ecrireDernier(n) {
      try {
        sessionStorage.setItem('notif_dernier', String(n))
      } catch (e) {}
    }
  
    async function verifier() {
      try {
        const r = await fetch('/notifications/compte', {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin',
        })
        if (!r.ok) return
        const data = await r.json()
        const count = Number(data.count) || 0
        afficher(count)
        const dernier = lireDernier()
        if (dernier !== null && count > dernier) bip()
        ecrireDernier(count)
      } catch (e) {}
    }
  
    verifier()
    setInterval(verifier, 10000)
  })()