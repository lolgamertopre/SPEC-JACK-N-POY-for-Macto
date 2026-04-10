const CHOICES = ['Rock', 'Paper', 'Scissors'];
const EMOJIS  = { Rock: '✊', Paper: '🖐', Scissors: '✌️' };
const WINS    = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' };

let pScore = 0, cScore = 0;
let audioUnlocked = false;
let gameOver = false;
const MAX_SCORE = 5; // ⭐ first to 5 wins

// Cache DOM
const pEl = document.getElementById('playerScore');
const cEl = document.getElementById('computerScore');
const resultEl = document.getElementById('resultText');
const audio = document.getElementById('fahAudio');

// Unlock audio
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

// Flash effect
function flash(el, type) {
  el.classList.remove('flash-win', 'flash-lose');
  void el.offsetWidth;
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

// Sound
function playFah() {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// Random CPU
function getCPUChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

// Disable buttons (optional but nice UX)
function setButtonsDisabled(disabled) {
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = disabled;
  });
}

// Check winner
function checkGameOver() {
  if (pScore === MAX_SCORE || cScore === MAX_SCORE) {
    gameOver = true;
    setButtonsDisabled(true);

    if (pScore > cScore) {
      showResult('🎉 YOU WON THE GAME!', 'win');
    } else {
      showResult('💀 CPU WON THE GAME!', 'lose');
    }
  }
}

// Main game
function play(playerChoice) {
  if (gameOver) return;

  unlockAudio();
  setButtonsDisabled(true); // prevent spam clicking

  const cpu = getCPUChoice();

  setTimeout(() => {
    if (playerChoice === cpu) {
      showResult(`TIE — ${EMOJIS[cpu]} ${cpu}`, 'tie');
    } else if (WINS[playerChoice] === cpu) {
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

    checkGameOver();
    if (!gameOver) setButtonsDisabled(false);

  }, 400); // small delay = nicer feel
}

// Reset
function resetGame() {
  pScore = 0;
  cScore = 0;
  gameOver = false;

  pEl.textContent = '0';
  cEl.textContent = '0';

  setButtonsDisabled(false);
  showResult('GAME RESET — MAKE YOUR MOVE', '');
}

// Preload audio
window.addEventListener('load', () => {
  if (audio) audio.load();
});