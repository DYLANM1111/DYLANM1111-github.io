const choices = ['rock', 'paper', 'scissors'];
const playerChoices = document.querySelectorAll('.choice');
const computerChoiceImg = document.getElementById('computer-choice');
const computerCaption = document.getElementById('computer-caption');
const result = document.getElementById('result');
const wins = document.getElementById('wins');
const losses = document.getElementById('losses');
const ties = document.getElementById('ties');
const resetButton = document.getElementById('reset');

let scores = {
    wins: 0,
    losses: 0,
    ties: 0
};

if (localStorage.getItem('rpsScores')) {
    scores = JSON.parse(localStorage.getItem('rpsScores'));
    updateScoreDisplay();
}

playerChoices.forEach(choice => {
    choice.addEventListener('click', () => {
        if (!choice.classList.contains('selected')) {
            playerChoices.forEach(c => c.classList.remove('selected'));
            choice.classList.add('selected');
            playGame(choice.id);
        }
    });
});

resetButton.addEventListener('click', resetScores);

function playGame(playerChoice) {
    result.textContent = "Computer is thinking...";
    computerCaption.textContent = "Thinking...";
    
    let cycleCount = 0;
    let cycleIndex = 0;
    const finalComputerChoice = choices[Math.floor(Math.random() * 3)];
    
    const cycleInterval = setInterval(() => {
        cycleIndex = (cycleIndex + 1) % 3;
        computerChoiceImg.src = `images/${choices[cycleIndex]}.PNG`;
        computerCaption.textContent = choices[cycleIndex].charAt(0).toUpperCase() + choices[cycleIndex].slice(1);
        
        cycleCount++;
        if (cycleCount >= 18) { 
            clearInterval(cycleInterval);
            computerChoiceImg.src = `images/${finalComputerChoice}.PNG`;
            computerCaption.textContent = finalComputerChoice.charAt(0).toUpperCase() + finalComputerChoice.slice(1);
            determineWinner(playerChoice, finalComputerChoice);
        }
    }, 167); 
}

function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        result.textContent = "It's a tie!";
        scores.ties++;
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        result.textContent = "You win!";
        scores.wins++;
    } else {
        result.textContent = "Computer wins!";
        scores.losses++;
    }
    
    updateScoreDisplay();
    saveScores();
}

function updateScoreDisplay() {
    wins.textContent = scores.wins;
    losses.textContent = scores.losses;
    ties.textContent = scores.ties;
}

function saveScores() {
    localStorage.setItem('rpsScores', JSON.stringify(scores));
}

function resetScores() {
    scores = { wins: 0, losses: 0, ties: 0 };
    updateScoreDisplay();
    saveScores();
    result.textContent = "Scores reset. Make your throw!";
    playerChoices.forEach(c => c.classList.remove('selected'));
    computerChoiceImg.src = 'images/question-mark.PNG';
    computerCaption.textContent = "Waiting...";
}