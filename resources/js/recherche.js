document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const queryInput = document.getElementById('query');
    const typeSelect = document.getElementById('type_recherche');
    
    // Création dynamique d'une zone pour afficher les résultats ou les messages d'état
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'mt-6 p-4 rounded-md hidden';
    form.parentNode.appendChild(resultsContainer);

    // 1. GÉOLOCALISATION AUTOMATIQUE
    // Ajout de champs cachés pour stocker la position géographique
    const latInput = document.createElement('input');
    latInput.type = 'hidden';
    latInput.name = 'latitude';
    
    const lngInput = document.createElement('input');
    lngInput.type = 'hidden';
    lngInput.name = 'longitude';
    
    form.appendChild(latInput);
    form.appendChild(lngInput);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latInput.value = position.coords.latitude;
                lngInput.value = position.coords.longitude;
            },
            (error) => {
                console.warn("Géolocalisation non disponible ou refusée :", error.message);
            }
        );
    }

    // 2. GESTION DE LA RECHERCHE VOCALE (Speech Recognition)
    // Ajout d'un bouton micro à côté du champ texte si le navigateur le supporte
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const micButton = document.createElement('button');
        micButton.type = 'button';
        micButton.innerHTML = '🎤 Parler';
        micButton.className = 'ml-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-md transition';
        
        // Insertion du bouton juste après l'input texte
        queryInput.parentNode.style.display = 'flex';
        queryInput.parentNode.style.alignItems = 'center';
        queryInput.parentNode.appendChild(micButton);

        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.interimResults = false;

        micButton.addEventListener('click', () => {
            typeSelect.value = 'AUDIO'; // Bascule auto sur le mode audio
            micButton.innerHTML = '🔴 Écoute...';
            micButton.classList.add('bg-red-100', 'text-red-700');
            recognition.start();
        });

        recognition.addEventListener('result', (event) => {
            const speechResult = event.results[0][0].transcript;
            queryInput.value = speechResult;
            micButton.innerHTML = '🎤 Parler';
            micButton.classList.remove('bg-red-100', 'text-red-700');
        });

        recognition.addEventListener('speechend', () => {
            recognition.stop();
            micButton.innerHTML = '🎤 Parler';
            micButton.classList.remove('bg-red-100', 'text-red-700');
        });

        recognition.addEventListener('error', (event) => {
            console.error('Erreur reconnaissance vocale:', event.error);
            micButton.innerHTML = '🎤 Parler';
            micButton.classList.remove('bg-red-100', 'text-red-700');
        });
    }

    // 3. SOUMISSION DU FORMULAIRE EN AJAX (Vers l'API de recherche)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        // Adaptation de l'action vers la route API définie dans votre routeur
        const actionUrl = '/api/v1/ai/search'; 

        resultsContainer.className = 'mt-6 p-4 rounded-md bg-blue-50 text-blue-800 border border-blue-200 block';
        resultsContainer.innerHTML = 'Recherche en cours...';

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    // Récupération du token CSRF d'AdonisJS si présent dans la page
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                let htmlContent = `<p class="font-semibold mb-2">${result.reponseIa}</p>`;
                
                if (result.data && result.data.length > 0) {
                    htmlContent += '<ul class="list-disc pl-5 space-y-1 text-sm">';
                    result.data.forEach(item => {
                        htmlContent += `<li>${item.title || item.nom || 'Résultat trouvé'}</li>`;
                    });
                    htmlContent += '</ul>';
                } else {
                    htmlContent += '<p class="text-sm text-gray-600">Aucun résultat direct trouvé pour le moment.</p>';
                }

                resultsContainer.innerHTML = htmlContent;

                // Redirection automatique si une cible a été trouvée et renvoyée par le backend
                if (result.redirectUrl) {
                    setTimeout(() => {
                        window.location.href = result.redirectUrl;
                    }, 2000); // Petit délai de 2 secondes pour lire la réponse avant la redirection
                }
            } else {
                resultsContainer.className = 'mt-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200 block';
                resultsContainer.innerHTML = result.message || 'Une erreur est survenue lors de la recherche.';
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            resultsContainer.className = 'mt-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200 block';
            resultsContainer.innerHTML = 'Impossible de contacter le serveur.';
        }
    });
});