document.addEventListener('DOMContentLoaded', () => {
    console.log("Profil Personnel chargé avec succès.");

    // 1. Gestion de l'upload de la photo de profil
    setupAvatarUpload();

    // 2. Chargement dynamique des notifications en temps réel
    loadNotifications();
});

// Fonction pour l'upload d'avatar
function setupAvatarUpload() {
    const avatarContainer = document.querySelector('.user-profile-summary img');
    if (!avatarContainer) return;

    // Création d'un input file invisible pour déclencher le sélecteur d'image au clic sur l'avatar
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    avatarContainer.style.cursor = 'pointer';
    avatarContainer.title = 'Cliquez pour changer votre photo de profil';

    avatarContainer.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Vous devez être connecté pour effectuer cette action.");
            window.location.href = '/connexion';
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/v1/profil/avatar', {
                method: 'POST',
                headers: {
                    // Authentification définitive par Token Bearer (suppression du CSRF inutile pour l'API)
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                location.reload(); // Recharge pour afficher la nouvelle image
            } else {
                alert("Erreur lors de la mise à jour de la photo de profil.");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
        }
    });
}

// Fonction pour charger dynamiquement les notifications
async function loadNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/v1/notifications', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            // Si vous avez un conteneur de notifications dans votre vue, vous pouvez l'injecter ici
            console.log("Notifications chargées :", data);
        }
    } catch (error) {
        console.error("Impossible de charger les notifications en temps réel.", error);
    }
}