document.addEventListener('DOMContentLoaded', () => {
    // Éléments des différentes sections
    const sectionChoixType = document.getElementById('section-choix-type');
    const formPersonnel = document.getElementById('section-form-particulier');
    const formEntreprise = document.getElementById('section-form-entreprise');
    const formAdministration = document.getElementById('section-form-administration');
    
    const onboarding1 = document.getElementById('onboarding-1');
    const onboarding2 = document.getElementById('onboarding-2');
    const succesSection = document.getElementById('succes');
  
    // Boutons de choix de profil
    const btnTypeChoices = document.querySelectorAll('.btn-type-choice');
    const btnBackChoices = document.querySelectorAll('.btn-back-choice');
  
    // Boutons d'onboarding
    const btnOnboarding1 = document.getElementById('btn-onboarding-1');
    const btnOnboarding2 = document.getElementById('btn-onboarding-2');
  
    // Formulaires
    const reelFormPersonnel = document.getElementById('form-inscription-personnel');
    const reelFormEntreprise = document.getElementById('form-inscription-entreprise');
    const reelFormAdministration = document.getElementById('form-inscription-administration');
  
    // Fonction utilitaire pour basculer d'une section à une autre
    function switchSection(currentSection, nextSection) {
        if (currentSection) {
            currentSection.classList.remove('active');
            currentSection.classList.add('hidden');
        }
        if (nextSection) {
            nextSection.classList.remove('hidden');
            nextSection.classList.add('active');
        }
    }
  
    // 1. Gestion du clic sur les choix de type de compte
    btnTypeChoices.forEach(button => {
        button.addEventListener('click', () => {
            const targetType = button.getAttribute('data-target');
            
            if (targetType === 'particulier' || targetType === 'personnel') {
                switchSection(sectionChoixType, formPersonnel);
            } else if (targetType === 'entreprise') {
                switchSection(sectionChoixType, formEntreprise);
            } else if (targetType === 'administration') {
                switchSection(sectionChoixType, formAdministration);
            }
        });
    });
  
    // 2. Gestion du bouton "Retour au choix"
    btnBackChoices.forEach(btn => {
        btn.addEventListener('click', () => {
            const activeCard = btn.closest('.inscription-card');
            switchSection(activeCard, sectionChoixType);
        });
    });
  
    // 3. Simulation de soumission des formulaires pour déclencher l'Onboarding
    function handleFormSubmit(e, currentFormSection) {
        e.preventDefault(); 
        switchSection(currentFormSection, onboarding1);
    }
  
    if (reelFormPersonnel) {
        reelFormPersonnel.addEventListener('submit', (e) => handleFormSubmit(e, formPersonnel));
    }
    if (reelFormEntreprise) {
        reelFormEntreprise.addEventListener('submit', (e) => handleFormSubmit(e, formEntreprise));
    }
    if (reelFormAdministration) {
        reelFormAdministration.addEventListener('submit', (e) => handleFormSubmit(e, formAdministration));
    }
  
    // 4. Gestion de la progression de l'Onboarding
    if (btnOnboarding1) {
        btnOnboarding1.addEventListener('click', () => {
            switchSection(onboarding1, onboarding2);
        });
    }
  
    if (btnOnboarding2) {
        btnOnboarding2.addEventListener('click', () => {
            switchSection(onboarding2, succesSection);
        });
    }
  
    // 5. Gestion de l'affichage/masquage des mots de passe (Universel + Spécifique Personnel)
    const toggleButtons = document.querySelectorAll('.btn-toggle');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.input-wrapper');
            const passwordInput = wrapper ? wrapper.querySelector('input[type="password"], input[type="text"]') : null;
  
            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    btn.textContent = '👁️‍🗨️';
                } else {
                    passwordInput.type = 'password';
                    btn.textContent = '👁️';
                }
            }
        });
    });
  
    // 6. Gestion dynamique Pays -> Villes (Prend en compte l'ID et les classes)
    const paysSelects = document.querySelectorAll('.select-pays, #select-pays');

    const villesParPays = {
        "RDC": ["Lubumbashi", "Kinshasa", "Kolwezi", "Likasi", "Goma", "Bukavu", "Kisangani", "Matadi"],
        "Zambie": ["Lusaka", "Ndola", "Kitwe", "Livingstone"],
        "Angola": ["Luanda", "Lubango", "Benguela", "Cabinda"],
        "Congo-Brazzaville": ["Brazzaville", "Pointe-Noire", "Dolisie"],
        "France": ["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse"]
    };

    paysSelects.forEach(selectPays => {
        selectPays.addEventListener('change', (e) => {
            const paysChoisi = e.target.value;
            const villes = villesParPays[paysChoisi] || [];

            // Trouve le formulaire ou la section parente commune
            const formParent = selectPays.closest('form') || selectPays.closest('.inscription-card');
            
            // Cherche le select de ville à l'intérieur de ce même formulaire/section (gère l'ID ou la classe)
            const selectVille = formParent ? formParent.querySelector('.select-ville, #select-ville') : null;

            if (selectVille) {
                // Réinitialiser le select des villes
                selectVille.innerHTML = '<option value="" disabled selected>Choisissez la ville</option>';

                // Remplir avec les nouvelles villes
                villes.forEach(ville => {
                    const option = document.createElement('option');
                    option.value = ville;
                    option.textContent = ville;
                    selectVille.appendChild(option);
                });
            }
        });
    });
});