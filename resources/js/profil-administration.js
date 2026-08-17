/**
 * Script pour le Profil Administration Publique - MAVILLE
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Gestion des onglets de navigation du profil
  const tabItems = document.querySelectorAll('.profile-tabs .tab-item');
  
  tabItems.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Retirer la classe active de tous les onglets
      tabItems.forEach(t => {
        t.classList.remove('active', 'border-b-2', 'border-green-700', 'text-green-700', 'font-600');
        t.classList.add('text-gray-500');
      });
      
      // Activer l'onglet cliqué
      tab.classList.add('active', 'border-b-2', 'border-green-700', 'text-green-700', 'font-600');
      tab.classList.remove('text-gray-500');
    });
  });

  // 2. Gestion des clics sur les services rapides
  const serviceBoxes = document.querySelectorAll('.service-box');
  
  serviceBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const serviceName = box.querySelector('.text-xs').textContent;
      console.log(`Action rapide sélectionnée : ${serviceName}`);
      
      // Exemple de retour visuel ou ouverture de modale de formulaire
      // alert(`Ouverture du service : ${serviceName}`);
    });
  });

  // 3. Boutons d'action du profil (Modifier / Publier)
  const editProfileBtn = document.querySelector('button.border-gray-300');
  const publishBtn = document.querySelector('button.bg-green-700');

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      console.log("Ouverture du mode édition de l'administration...");
      // Logique pour basculer en mode édition des informations de la mairie
    });
  }

  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      console.log("Ouverture de la fenêtre de création de communiqué...");
      // Logique pour ouvrir l'éditeur de publication
    });
  }
});