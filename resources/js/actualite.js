document.addEventListener('DOMContentLoaded', () => {
    const videoElements = document.querySelectorAll('video.post-media');
  
    videoElements.forEach((video) => {
      // S'assurer que le son est activé par défaut
      video.muted = false;
  
      // Vérifier la durée maximale de 4 minutes (240 secondes)
      video.addEventListener('loadedmetadata', () => {
        if (video.duration > 240) {
          console.warn("Cette vidéo dépasse la limite autorisée de 4 minutes.");
        }
      });
  
      // Contrôle de lecture pour s'assurer qu'une seule vidéo ne se joue à la fois (optionnel)
      video.addEventListener('play', () => {
        videoElements.forEach((otherVideo) => {
          if (otherVideo !== video && !otherVideo.paused) {
            otherVideo.pause();
          }
        });
      });
    });
  });