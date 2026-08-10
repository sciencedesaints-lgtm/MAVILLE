document.addEventListener('DOMContentLoaded', () => {
    // Fonction globale pour répondre à une demande de mise en relation
    window.repondre = async function(id, statut) {
        // Trouver les boutons de la notification concernée pour les désactiver pendant le traitement
        const notificationElement = document.querySelector(`[data-notification-id="${id}"]`) || event.target.closest('.notification-card');
        const buttons = notificationElement ? notificationElement.querySelectorAll('button') : [];
        
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });

        try {
            const response = await fetch(`/api/v1/notifications/${id}/repondre`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // Récupération sécurisée du token CSRF d'AdonisJS
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ statut })
            });

            const result = await response.json();

            if (response.ok) {
                // Optionnel : Afficher un petit message de succès ou recharger directement la page
                location.reload(); 
            } else {
                alert(result.message || 'Une erreur est survenue lors du traitement de la demande.');
                buttons.forEach(btn => {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                });
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
            alert('Impossible de contacter le serveur.');
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
        }
    };
});