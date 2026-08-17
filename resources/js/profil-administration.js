document.addEventListener('DOMContentLoaded', () => {
    console.log("Portail Administration publique initialisé.");

    // 1. Gestion de l'upload du sceau / avatar institutionnel
    setupAdminAvatarUpload();

    // 2. Initialisation des flux de signalements et alertes citoyennes
    loadAdminDashboardData();
});

function setupAdminAvatarUpload() {
    const adminAvatar = document.querySelector('.user-profile-summary img');
    if (!adminAvatar) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    adminAvatar.style.cursor = 'pointer';
    adminAvatar.title = 'Cliquez pour modifier l\'emblème officiel';

    adminAvatar.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/v1/profil/avatar', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: formData
            });

            if (response.ok) {
                location.reload();
            } else {
                alert("Erreur lors de la mise à jour de l'emblème.");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
        }
    });
}

async function loadAdminDashboardData() {
    // Logique pour récupérer les rapports et requêtes citoyennes en attente
    console.log("Chargement du tableau de bord institutionnel...");
}