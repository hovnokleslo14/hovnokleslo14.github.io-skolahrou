// Discord webhook URL
const webhookURL = 'https://ptb.discord.com/api/webhooks/1275592016977199125/a71ZNI-GpJl_XmbWeqJxeFlKrhUzM_SDfQ8NhZYvxCkoPmnv0p2QaQNGPbKiBcUGoduN'; // Zde vlož odkaz na tvůj webhook

let username = '';
let startTime;

const pronounSets = [
    [
        { question: 'Její', correct: 'Her' },
        { question: 'Jeho', correct: 'His' },
        { question: 'Naše', correct: 'Our' }
    ],
    [
        { question: 'Jejich', correct: 'Their' },
        { question: 'Tvůj', correct: 'Your' },
        { question: 'Můj', correct: 'My' }
    ],
    [
        { question: 'Tvoje', correct: 'Your' },
        { question: 'Její', correct: 'Her' },
        { question: 'Jeho', correct: 'His' }
    ],
    [
        { question: 'Naše', correct: 'Our' },
        { question: 'Jejich', correct: 'Their' },
        { question: 'Můj', correct: 'My' }
    ],
    [
        { question: 'Tvoje', correct: 'Your' },
        { question: 'Můj', correct: 'My' },
        { question: 'Jejich', correct: 'Their' }
    ]
];

let currentPage = 0;
const totalPages = pronounSets.length;
let answers = [];

// Funkce pro odeslání dat na Discord webhook pomocí embedů
function sendToWebhook(embeds) {
    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: "Kvíz Angličtina",
            embeds: embeds
        })
    });
}

// Požádej uživatele o jméno při načtení stránky
function askForName() {
    username = prompt('Zadej své jméno:');
    if (username) {
        // Zaznamenání začátku času
        startTime = new Date();

        // Odeslání jména na Discord webhook
        sendToWebhook([{
            title: "Uživatel zahájil kvíz",
            description: `Uživatel **${username}** právě začal kvíz.`,
            color: 3447003 // Modrá barva
        }]);
        startLearning();
    } else {
        alert('Musíš zadat své jméno, aby mohl kvíz začít.');
    }
}

function startLearning() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('pronouns').classList.remove('hidden');
    document.querySelector('.draggable-items').classList.remove('hidden');
    loadPage(0);
}

function loadPage(pageIndex) {
    const pronounPage = pronounSets[pageIndex];
    const pageContainer = document.getElementById('pronounPages');
    const draggableContainer = document.querySelector('.draggable-items');
    
    pageContainer.innerHTML = '';
    draggableContainer.innerHTML = '';

    pronounPage.forEach((item, index) => {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
            <span>${item.question}</span>
            <div class="dropzone" data-index="${index}" data-correct="${item.correct}"></div>
        `;
        pageContainer.appendChild(row);
    });

    // Přidej všechny možnosti (zájmena) do draggable boxů
    const allPronouns = ['Her', 'His', 'Our', 'Their', 'Your', 'My']; // Všechna dostupná zájmena
    allPronouns.forEach(pronoun => {
        const draggable = document.createElement('div');
        draggable.classList.add('draggable');
        draggable.setAttribute('draggable', 'true');
        draggable.textContent = pronoun;
        draggableContainer.appendChild(draggable);
    });

    initializeDragAndDrop();

    if (currentPage === totalPages - 1) {
        document.getElementById('nextBtn').textContent = 'Hotovo';
    } else {
        document.getElementById('nextBtn').textContent = 'Další';
    }
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        collectAnswers();
        currentPage++;
        loadPage(currentPage);
    } else {
        collectAnswers();
        checkAnswers();
    }
}

function collectAnswers() {
    const dropzones = document.querySelectorAll('.dropzone');
    dropzones.forEach(dropzone => {
        const answer = dropzone.textContent.trim();
        const index = dropzone.getAttribute('data-index');
        answers[currentPage * 3 + parseInt(index)] = answer || 'Nezodpovězeno';
    });
}

function checkAnswers() {
    document.getElementById('pronouns').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');

    const resultList = document.getElementById('resultList');
    resultList.innerHTML = '';

    let correctAnswers = [];
    let incorrectAnswers = [];

    pronounSets.flat().forEach((item, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === item.correct;
        const resultItem = document.createElement('div');
        resultItem.classList.add('result');
        if (isCorrect) {
            resultItem.innerHTML = `<strong>${item.question}</strong>: Vaše odpověď <span class="correct">${userAnswer}</span> je správná!`;
            correctAnswers.push(`${item.question}: **${userAnswer}**`);
        } else {
            resultItem.innerHTML = `<strong>${item.question}</strong>: Vaše odpověď <span class="incorrect">${userAnswer}</span> je špatná. Správná odpověď je <span class="correct">${item.correct}</span>.`;
            incorrectAnswers.push(`${item.question}: **${userAnswer}** (Správně: ${item.correct})`);
        }
        resultList.appendChild(resultItem);
    });

    // Počítání času dokončení
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000; // Délka v sekundách

    // Zobrazit čas dokončení
    const timeTakenElement = document.createElement('div');
    timeTakenElement.classList.add('time-taken');
    timeTakenElement.innerHTML = `<p>Dokončeno za: <strong>${timeTaken}</strong> sekund.</p>`;
    resultList.appendChild(timeTakenElement);

    // Přidání tlačítka Home
    const homeButton = document.createElement('button');
    homeButton.innerText = 'Home';
    homeButton.classList.add('home-btn');
    homeButton.onclick = () => {
        window.location.reload(); // Znovu načíst stránku a vrátit se na hlavní menu
    };
    resultList.appendChild(homeButton);

    // Vytvoření embed zpráv
    const embeds = [
        {
            title: `Uživatel ${username} dokončil kvíz`,
            description: `Celkový čas: **${timeTaken} sekund**`,
            color: 3447003 // Modrá barva
        },
        {
            title: "Správné odpovědi",
            description: correctAnswers.length > 0 ? correctAnswers.join('\n') : 'Žádné správné odpovědi',
            color: 3066993 // Zelená barva
        },
        {
            title: "Špatné odpovědi",
            description: incorrectAnswers.length > 0 ? incorrectAnswers.join('\n') : 'Žádné špatné odpovědi',
            color: 15158332 // Červená barva
        }
    ];

    // Odeslání výsledků na Discord webhook
    sendToWebhook(embeds);
}

function initializeDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const dropzones = document.querySelectorAll('.dropzone');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    });

    dropzones.forEach(dropzone => {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement) {
                dropzone.textContent = draggingElement.textContent;
            }
        });
    });
}

// Spustí se, když se načte stránka
window.onload = askForName;
