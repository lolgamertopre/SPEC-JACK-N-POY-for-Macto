const CHOICES = ['Rock', 'Paper', 'Scissors'];
const EMOJIS  = { Rock: '✊', Paper: '🖐', Scissors: '✌️' };
const WINS    = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' };

let pScore = 0, cScore = 0;
let audioUnlocked = false;

// Cache DOM elements (faster & cleaner)
const pEl = document.getElementById('playerScore');
const cEl = document.getElementById('computerScore');
const resultEl = document.getElementById('resultText');
const audio = document.getElementById('fahAudio');

// Unlock audio once
function unlockAudio() {
  if (audioUnlocked || !audio) return;
  audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audioUnlocked = true;
    })
    .catch(() => {});
}

// Flash animation
function flash(el, type) {
  el.classList.remove('flash-win', 'flash-lose');
  void el.offsetWidth; // force reflow
  el.classList.add(type === 'win' ? 'flash-win' : 'flash-lose');

  setTimeout(() => {
    el.classList.remove('flash-win', 'flash-lose');
  }, 600);
}

// Show result
function showResult(text, type) {
  resultEl.className = `${type} result-pop`;
  resultEl.textContent = text;

  resultEl.addEventListener(
    'animationend',
    () => resultEl.classList.remove('result-pop'),
    { once: true }
  );
}

// Play lose sound
function playFah() {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// Get random choice (cleaner)
function getCPUChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

// Main game
function play(playerChoice) {
  unlockAudio();

  const cpu = getCPUChoice();

  if (playerChoice === cpu) {
    showResult(`TIE — ${EMOJIS[cpu]} ${cpu}`, 'tie');
    return;
  }

  if (WINS[playerChoice] === cpu) {
    pScore++;
    pEl.textContent = pScore;
    flash(pEl, 'win');
    showResult(`YOU WIN — ${EMOJIS[playerChoice]} beats ${EMOJIS[cpu]}`, 'win');
  } else {
    cScore++;
    cEl.textContent = cScore;
    flash(cEl, 'lose');
    showResult(`CPU WINS — ${EMOJIS[cpu]} beats ${EMOJIS[playerChoice]}`, 'lose');
    playFah();
  }
}

// Reset game
function resetGame() {
  pScore = 0;
  cScore = 0;

  pEl.textContent = '0';
  cEl.textContent = '0';

  showResult('GAME RESET — MAKE YOUR MOVE', '');
}

// Preload audio
window.addEventListener('load', () => {
  if (audio) audio.load();
});