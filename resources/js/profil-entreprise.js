document.addEventListener('DOMContentLoaded', () => {
    console.log("Espace Entreprise & Agence initialisé.");

    // 1. Gestion de l'upload du logo de l'entreprise
    setupEnterpriseLogoUpload();

    // 2. Chargement des statistiques de leads et prospects en temps réel
    loadEnterpriseStats();
});

function setupEnterpriseLogoUpload() {
    const logoContainer = document.querySelector('.user-profile-summary img');
    if (!logoContainer) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/jpg';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    logoContainer.style.cursor = 'pointer';
    logoContainer.title = 'Cliquez pour modifier le logo de l\'entreprise';

    logoContainer.addEventListener('click', () => {
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
                alert("Erreur lors de la mise à jour du logo.");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
        }
    });
}

async function loadEnterpriseStats() {
    // Logique pour récupérer le nombre de clients notifiés et d'offres actives
    console.log("Chargement des leads professionnels...");
}