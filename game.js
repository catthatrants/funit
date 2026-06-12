// Game State
let gameState = {
    currentScreen: 'home',
    currentGameMode: null,
    score: 0,
    questionIndex: 0,
    correctAnswers: 0,
    currentQuestion: null,
    answered: false,
    quizzes: JSON.parse(localStorage.getItem('quizzes')) || [],
};

// Sample Questions
const sampleQuestions = [
    {
        question: "What is the capital of France?",
        answers: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "What is 2 + 2?",
        answers: ["3", "4", "5", "6"],
        correct: 1
    },
    {
        question: "What is the largest planet in our solar system?",
        answers: ["Saturn", "Jupiter", "Neptune", "Venus"],
        correct: 1
    },
    {
        question: "Who wrote Romeo and Juliet?",
        answers: ["Mark Twain", "Charles Dickens", "William Shakespeare", "Jane Austen"],
        correct: 2
    },
    {
        question: "What is the chemical symbol for Gold?",
        answers: ["Go", "Gd", "Au", "Ag"],
        correct: 2
    },
    {
        question: "In which year did the Titanic sink?",
        answers: ["1912", "1920", "1905", "1915"],
        correct: 0
    },
    {
        question: "What is the smallest country in the world?",
        answers: ["Monaco", "Vatican City", "San Marino", "Luxembourg"],
        correct: 1
    },
    {
        question: "How many continents are there?",
        answers: ["5", "6", "7", "8"],
        correct: 2
    },
    {
        question: "What is the speed of light?",
        answers: ["300,000 km/s", "150,000 km/s", "600,000 km/s", "100,000 km/s"],
        correct: 0
    },
    {
        question: "What is the most spoken language in the world?",
        answers: ["Spanish", "English", "Mandarin Chinese", "Hindi"],
        correct: 2
    }
];

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function backToHome() {
    showScreen('homeScreen');
}

function goToGameMode() {
    showScreen('gameModeScreen');
}

function goToCreateMode() {
    showScreen('createScreen');
    initializeQuestionForm();
}

function showAbout() {
    alert('FUnit - A Blooket-like game for learning!\n\nCreate and play interactive quizzes with your friends.\n\nHave fun learning! 🎉');
}

// Game Functions
function startGame(mode) {
    gameState.currentGameMode = mode;
    gameState.score = 0;
    gameState.questionIndex = 0;
    gameState.correctAnswers = 0;
    gameState.answered = false;
    
    showScreen('gameScreen');
    loadQuestion();
}

function loadQuestion() {
    if (gameState.questionIndex >= sampleQuestions.length) {
        endGame();
        return;
    }

    gameState.currentQuestion = sampleQuestions[gameState.questionIndex];
    gameState.answered = false;

    document.getElementById('question').textContent = gameState.currentQuestion.question;
    document.getElementById('questionCount').textContent = gameState.questionIndex + 1;
    document.getElementById('score').textContent = gameState.score;

    const container = document.getElementById('answersContainer');
    container.innerHTML = '';

    gameState.currentQuestion.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(index);
        container.appendChild(btn);
    });
}

function selectAnswer(index) {
    if (gameState.answered) return;

    gameState.answered = true;
    const buttons = document.querySelectorAll('.answer-btn');
    const isCorrect = index === gameState.currentQuestion.correct;

    // Show correct and incorrect
    buttons.forEach((btn, btnIndex) => {
        btn.classList.add('disabled');
        if (btnIndex === gameState.currentQuestion.correct) {
            btn.classList.add('correct');
        } else if (btnIndex === index && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Update score
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.score += 10;
    } else {
        gameState.score = Math.max(0, gameState.score - 5);
    }

    document.getElementById('score').textContent = gameState.score;

    // Next question
    setTimeout(() => {
        gameState.questionIndex++;
        loadQuestion();
    }, 1500);
}

function endGame() {
    const accuracy = Math.round((gameState.correctAnswers / sampleQuestions.length) * 100);
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctAnswers').textContent = gameState.correctAnswers;
    document.getElementById('accuracy').textContent = accuracy;

    showScreen('resultsScreen');
}

// Quiz Creation
function initializeQuestionForm() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    addQuestion();
}

function addQuestion() {
    const container = document.getElementById('questionsContainer');
    const questionCount = container.children.length + 1;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'form-group';
    questionDiv.id = `question-${questionCount}`;
    questionDiv.innerHTML = `
        <h4>Question ${questionCount}</h4>
        <label>Question Text:</label>
        <input type="text" placeholder="Enter question" required>
        <label style="margin-top: 10px;">Answer Options (comma separated):</label>
        <input type="text" placeholder="Option 1, Option 2, Option 3, Option 4" required>
        <label style="margin-top: 10px;">Correct Answer Number (1-4):</label>
        <input type="number" min="1" max="4" placeholder="1" required>
        <button type="button" class="btn btn-secondary" style="margin-top: 10px;" onclick="removeQuestion(${questionCount})">Remove</button>
    `;
    container.appendChild(questionDiv);
}

function removeQuestion(questionNum) {
    const element = document.getElementById(`question-${questionNum}`);
    if (element) {
        element.remove();
    }
}

// Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quizForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('quizTitle').value;
            const description = document.getElementById('quizDescription').value;
            
            const questions = [];
            const questionElements = document.querySelectorAll('#questionsContainer > div');
            
            questionElements.forEach(el => {
                const inputs = el.querySelectorAll('input');
                const question = inputs[0].value;
                const answers = inputs[1].value.split(',').map(a => a.trim());
                const correctIndex = parseInt(inputs[2].value) - 1;
                
                questions.push({ question, answers, correct: correctIndex });
            });
            
            const quiz = { id: Date.now(), title, description, questions };
            gameState.quizzes.push(quiz);
            localStorage.setItem('quizzes', JSON.stringify(gameState.quizzes));
            
            alert('Quiz created successfully!');
            backToHome();
        });
    }
});
