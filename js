let isAddingMember = false; // Indique si un membre est en cours d'ajout
let newBubbleColor; // Couleur de la nouvelle bulle de membre

const members = []; // Tableau pour stocker les membres
const bloc1Members = []; // Tableau pour stocker les membres du bloc 1

// Sélection des éléments du DOM
const listMembersDiv = document.querySelector('.list-members');
const addButton = document.querySelector('.add-bubble');
const editButton = document.querySelector('.edit-button');
const bloc1 = document.querySelector('.bloc1');
const participantContainer = document.querySelector('.participant-container');
const shuffleButton = document.querySelector('.shuffle-button');

// Ajout d'un gestionnaire d'événement pour le bouton de mélange
shuffleButton.addEventListener('click', handleShuffleButtonClick);

// Chargement des membres depuis le stockage local lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadMembersFromLocalStorage();
});

// Ajout d'un gestionnaire d'événement pour le clic sur le bouton d'ajout
addButton.addEventListener('click', handleAddButtonClick);

// Ajout d'un gestionnaire d'événement pour le clic sur le bouton d'édition
editButton.addEventListener('click', handleEditButtonClick);

// Fonction pour charger les membres depuis le stockage local
function loadMembersFromLocalStorage() {
    const storedMembers = localStorage.getItem('members');

    if (storedMembers) {
        members.push(...JSON.parse(storedMembers));
        displayAllMembers();
    }
}

// Fonction pour enregistrer les membres dans le stockage local
function saveMembersToLocalStorage() {
    localStorage.setItem('members', JSON.stringify(members));
}

// Fonction pour afficher tous les membres
function displayAllMembers() {
    listMembersDiv.innerHTML = '';
    members.forEach((member) => {
        createMemberBubble(member);
    });
}

// Fonction pour créer une bulle de membre
function createMemberBubble(member) {
    let fullName, color, initials;

    if (typeof member === 'object' && member.firstName && member.lastName && member.color) {
        fullName = ${member.firstName} ${member.lastName};
        color = member.color;
        initials = ${member.firstName.charAt(0)}${member.lastName.charAt(0)};
    } else if (typeof member === 'string') {
        fullName = member;
        color = getRandomColorHex();
        const [firstName, lastName] = fullName.split(' ');
        initials = ${firstName.charAt(0)}${lastName.charAt(0)};
    } else {
        console.error('Le membre est dans un format non pris en charge :', member);
        return;
    }

    const [firstName, lastName] = fullName.split(' ');

    const newBubble = createBubble(color); // Créer une nouvelle bulle de membre
    newBubble.setAttribute('data-first-name', firstName);
    newBubble.setAttribute('data-last-name', lastName);

    const fullNameBubble = document.createElement('div');
    fullNameBubble.classList.add('full-name-bubble');

    const nameText = document.createElement('div');
    nameText.className = 'name-text';
    nameText.textContent = ${firstName} ${lastName};

    const initialsElement = document.createElement('div');
    initialsElement.className = 'initials';
    initialsElement.textContent = initials;

    fullNameBubble.appendChild(initialsElement);
    fullNameBubble.appendChild(nameText);
    newBubble.appendChild(fullNameBubble);

    const deleteIcon = document.createElement('div');
    deleteIcon.classList.add('delete-icon', 'hide');
    deleteIcon.textContent = 'x';

    // Ajout de gestionnaires d'événements pour le clic sur la bulle et sur l'icône de suppression
    newBubble.addEventListener('click', () => {
        addMemberToParticipant(firstName, lastName, color);
    });

    deleteIcon.addEventListener('click', () => {
        removeMember(${firstName} ${lastName});
        newBubble.remove();
    });

    newBubble.appendChild(deleteIcon);

    newBubble.originalColor = color; // Stocker la couleur originale

    listMembersDiv.appendChild(newBubble);
}

// Ajout d'un membre aux participants du bloc 1
function addMemberToParticipant(firstName, lastName, color) {
    if (editButton.textContent === 'Terminer') {
        // Si le mode édition est activé, ne pas ajouter le membre aux participants
        return;
    }

    const participant = { prenom: firstName, nom: lastName, couleur: color };

    const existingParticipant = bloc1Members.find(p => {
        return p.prenom === firstName && p.nom === lastName && p.couleur === color;
    });

    if (existingParticipant) {
        console.log('Ce participant existe déjà dans le bloc 1 :', existingParticipant);
        return;
    }

    bloc1Members.push(participant);
    generateParticipantHTML(bloc1Members);

    const bubbleToDisable = document.querySelector(.bubble[data-first-name="${firstName}"][data-last-name="${lastName}"]);
    if (bubbleToDisable) {
        bubbleToDisable.classList.add('disabled');
        bubbleToDisable.style.backgroundColor = '';
    }
}

// Supprimer un membre
function removeMember(memberFullName) {
    const index = members.findIndex(m => {
        const fullName = ${m.firstName} ${m.lastName};
        return fullName === memberFullName;
    });

    if (index !== -1) {
        const [firstName, lastName] = memberFullName.split(' ');
        resetBubbleColor(firstName, lastName); // Réinitialiser la couleur de la bulle
        members.splice(index, 1);
        saveMembersToLocalStorage();
    }
}

// Réinitialiser la couleur de la bulle de membre
function resetBubbleColor(firstName, lastName) {
    const bubbleToReset = document.querySelector(.bubble[data-first-name="${firstName}"][data-last-name="${lastName}"]);
    if (bubbleToReset) {
        bubbleToReset.style.backgroundColor = bubbleToReset.originalColor;
    }
}

// Ajouter un membre
function addMember(firstName, lastName) {
    const existingMember = members.find(member => member.firstName === firstName && member.lastName === lastName);

    if (existingMember) {
        console.log('Ce membre existe déjà :', existingMember);
    } else {
        const newMember = {
            firstName: firstName,
            lastName: lastName,
            color: newBubbleColor || getRandomColorHex(),
        };
        members.push(newMember);
        saveMembersToLocalStorage();
    }

    displayAllMembers();
    isAddingMember = false;
    resetAddButton();
}

// Gestionnaire d'événement pour le clic sur le bouton d'ajout
function handleAddButtonClick() {
    if (editButton.textContent === 'Terminer') {
        // Si le mode édition est activé, ne pas autoriser l'ajout de membre
        return;
    }
    
    isAddingMember = true;
    addButton.disabled = true;
    addButton.classList.add('disabled-button'); // Ajouter la classe pour désactiver visuellement le bouton
    editButton.classList.add('grayed-out-style');

    newBubbleColor = getRandomColorHex();
    const newBubble = createBubble(newBubbleColor);

    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    createInput('first-name-input', 'Prénom', inputContainer);
    createInput('last-name-input', 'Nom', inputContainer);

    newBubble.appendChild(inputContainer);

    const firstNameInput = inputContainer.querySelector('#first-name-input');
    const lastNameInput = inputContainer.querySelector('#last-name-input');

    if (firstNameInput && lastNameInput) {
        firstNameInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                handleInputEnter(newBubble);
            }
        });

        lastNameInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                handleInputEnter(newBubble);
            }
        });
    } else {
        console.error('Les éléments firstNameInput et lastNameInput n\'ont pas été trouvés dans le DOM.');
    }

    listMembersDiv.appendChild(newBubble);
}


// Gestionnaire d'événement pour la touche "Enter" dans les champs d'entrée
function handleInputEnter(bubble) {
    const { firstName, lastName } = getInputValues(bubble);
    addMember(firstName, lastName);
}

// Réinitialiser le bouton d'ajout
function resetAddButton() {
    addButton.classList.remove('disabled-style');
    editButton.classList.remove('grayed-out-style');
    addButton.disabled = false;
}

// Gestionnaire d'événement pour le clic sur le bouton d'édition
function handleEditButtonClick() {
    if (isAddingMember) {
        return;
    }

    const editMode = editButton.textContent === 'Modifier';

    listMembersDiv.querySelectorAll('.bubble:not(.add-bubble)').forEach((bubble) => {
        const deleteIcon = bubble.querySelector('.delete-icon');

        if (editMode) {
            bubble.classList.add('edit-bubble');
            deleteIcon.classList.remove('hide');
        } else {
            bubble.classList.remove('edit-bubble');
            deleteIcon.classList.add('hide');
        }
    });

    editButton.textContent = editMode ? 'Terminer' : 'Modifier';
    resetAddButton();
}

// Générer le code HTML pour afficher les participants du bloc 1
function generateParticipantHTML(participants) {
    if (participantContainer) {
        participantContainer.innerHTML = '';

        participants.forEach(participant => {
            const participantColor = participant.couleur;

            const participantElement = document.createElement('div');
            participantElement.classList.add('participant');

            const nameContainer = document.createElement('div');
            nameContainer.classList.add('name-container');

            const initialsContainer = document.createElement('div');
            initialsContainer.classList.add('initials-container');

            const initials = document.createElement('div');
            initials.className = 'initials';
            initials.textContent = ${participant.prenom.charAt(0)}${participant.nom.charAt(0)};
            initials.style.backgroundColor = participantColor;

            initialsContainer.appendChild(initials);
            nameContainer.appendChild(initialsContainer);

            const nameText = document.createElement('div');
            nameText.className = 'name-text';
            nameText.textContent = ${participant.prenom} ${participant.nom};

            nameContainer.appendChild(nameText);
            participantElement.appendChild(nameContainer);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'X';

            deleteButton.addEventListener('click', () => {
                removeParticipantFromBloc1(participant);
                participantElement.remove();
            });

            participantElement.appendChild(deleteButton);

            participantContainer.appendChild(participantElement);
        });
    } else {
        console.error("L'élément .participant-container n'a pas été trouvé dans le DOM.");
    }
}

// Supprimer un participant du bloc 1
function removeParticipantFromBloc1(participant) {
    const index = bloc1Members.findIndex(p => {
        return p.prenom === participant.prenom && p.nom === participant.nom && p.couleur === participant.couleur;
    });

    if (index !== -1) {
        const { prenom, nom, couleur } = bloc1Members[index];
        resetMemberBubbleColor(prenom, nom, couleur); // Réinitialiser la couleur de la bulle
        bloc1Members.splice(index, 1);
    }
}

// Réinitialiser la couleur de la bulle de membre
function resetMemberBubbleColor(firstName, lastName, color) {
    const memberBubble = document.querySelector(.bubble[data-first-name="${firstName}"][data-last-name="${lastName}"]);
    if (memberBubble) {
        memberBubble.style.backgroundColor = color; // Réinitialiser la couleur de la bulle
    }
}

// Gestionnaire d'événement pour le clic sur le bouton de mélange des participants
function handleShuffleButtonClick() {
    bloc1Members.sort(() => Math.random() - 0.5);
    generateParticipantHTML(bloc1Members);
}

// Générer une couleur hexadécimale aléatoire
function getRandomColorHex() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Créer une bulle de membre
function createBubble(color) {
    const newBubble = document.createElement('button');
    newBubble.classList.add('bubble');
    newBubble.style.backgroundColor = color;
    return newBubble;
}

// Créer un champ d'entrée
function createInput(id, placeholder, parentElement) {
    const input = document.createElement('input');
    input.id = id;
    input.placeholder = placeholder;
    input.classList.add('bubble-input', id); // Ajout de la classe id pour la personnalisation CSS
    parentElement.appendChild(input);
}

// Récupérer les valeurs des champs d'entrée à partir de la bulle
function getInputValues(bubble) {
    const firstNameInput = bubble.querySelector('#first-name-input');
    const lastNameInput = bubble.querySelector('#last-name-input');

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    return { firstName, lastName };
}

// Générer et afficher le message dans le bloc 2
function generateAndDisplayMessage() {
    // Générer la date actuelle au format français
    const currentDate = new Date().toLocaleDateString('fr-FR');
    // Récupérer les noms des participants du bloc 1
    const participantNames = bloc1Members.map(participant => ${participant.prenom} ${participant.nom});

    // Sélectionner l'élément HTML pour mettre à jour le contenu
    const participantNamesElement = document.getElementById('participantNames');

    // Effacer le contenu existant
    participantNamesElement.innerHTML = '';

    // Créer une liste non-ordonnée pour les noms des participants
    const participantList = document.createElement('ul');

    // Ajouter chaque nom de participant comme un élément de liste
    participantNames.forEach(name => {
        const listItem = document.createElement('li');
        listItem.textContent = name;
        participantList.appendChild(listItem);
    });

    // Ajouter la liste de participants à l'élément approprié
    participantNamesElement.appendChild(participantList);

    // Sélectionner l'élément HTML pour mettre à jour la date
    const currentDateElement = document.getElementById('currentDate');

    // Mettre à jour le contenu avec les données générées
    currentDateElement.textContent = currentDate;

    // Afficher le bloc de texte
    const bloc2Message = document.querySelector('.bloc-text');
    bloc2Message.classList.remove('hide');
}

// Gestionnaire d'événement pour le clic sur le bouton de génération et d'affichage du message
const generateMessageButton = document.getElementById('generateButton');
generateMessageButton.addEventListener('click', generateAndDisplayMessage);

// Sélection du bouton jaune dans le DOM
const copyButton = document.getElementById('copyButton');

// Gestionnaire d'événements au clic sur le bouton jaune pour copier le message dans le presse-papiers
copyButton.addEventListener('click', () => {
    const participantList = document.getElementById('participantNames');
    const currentDate = document.getElementById('currentDate').textContent;

    let messageText = Hello !!\nPour info, voici la liste de passage du ${currentDate} :\n\n;
    
    // Ajouter les noms des participants au message sous forme de liste
    const participantItems = Array.from(participantList.querySelectorAll('li')).map(li => - ${li.textContent}).join('\n');
    messageText += ${participantItems}\n\n;

    messageText += Pour rappel :\n- L’agenda est très simple :\n- Qu’avez-vous fait cette semaine ?\n- Avez-vous rencontré des blocages ? Si oui, comment les avez-vous résolus ? Avez-vous pu les résoudre ?\n- Qu’avez-vous appris cette semaine ?\nSi vous pouvez partager un lien que vous avez découvert dans la semaine c’est top.\nSi vous n’êtes pas dispo, merci de me faire parvenir en MP vos détails !;

    navigator.clipboard.writeText(messageText)
        .then(() => {
            alert('Le message a été copié dans le presse-papiers avec succès!');
        })
        .catch((error) => {
            console.error('Une erreur est survenue lors de la copie du texte :', error);
            alert('Une erreur est survenue lors de la copie du texte. Veuillez réessayer.');
        });
});

document.addEventListener('DOMContentLoaded', function() {
    const flipButton = document.querySelector('.flip');
    const blocText = document.querySelector('.bloc-text');
    const participantNames = document.getElementById('participantNames');

    function handleFlip() {
        // Récupération des noms des participants
        const namesList = Array.from(participantNames.children).map(li => li.textContent);
        
        // Construction du texte pour le bouton "flip" avec les noms des participants sous forme de liste à puces
        let buttonText = Hello !!\nPour info, voici la liste de passage du ${getCurrentDate()} :\n\n;

        // Générer la liste à puces des participants
        const participantList = namesList.map(name => - ${name}).join('\n');

        // Ajouter la liste à puces au texte du bouton "flip"
        buttonText += ${participantList}\n\n;
        buttonText += Pour rappel :\n- L’agenda est très simple :\n- Qu’avez-vous fait cette semaine ?\n- Avez-vous rencontré des blocages ? Si oui, comment les avez-vous résolus ? Avez-vous pu les résoudre ?\n- Qu’avez-vous appris cette semaine ?\nSi vous pouvez partager un lien que vous avez découvert dans la semaine c’est top.\nSi vous n’êtes pas dispo, merci de me faire parvenir en MP vos détails !;

        // Mettre à jour le texte du bloc-text
        blocText.textContent = buttonText;
    }    

    // Fonction pour récupérer la date actuelle au format français
    function getCurrentDate() {
        const currentDate = new Date().toLocaleDateString('fr-FR');
        return currentDate;
    }

    // Ajout d'un gestionnaire d'événements au bouton "flip"
    flipButton.addEventListener('click', handleFlip);

    // Fonction pour mélanger les membres
function shuffleMembers() {
    bloc1Members.sort(() => Math.random() - 0.5);
    generateParticipantHTML(bloc1Members);
}

// Gestionnaire d'événements au clic sur le bouton "flip"
flipButton.addEventListener('click', () => {
    // Mélanger les membres
    shuffleMembers();

    // Mettre à jour le texte du bouton "flip"
    handleFlip();
});
});
