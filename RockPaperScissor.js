const CHOICES = ['Rock', 'Paper', 'Scissors'];
const EMOJIS  = { Rock: '✊', Paper: '🖐', Scissors: '✌️' };
const WINS    = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' };

const MAX_SCORE    = 5;
const DELAY_MS     = 500;  // ✅ one place to tune the round delay
const RESET_MS     = 3000; // ✅ one place to tune the auto-reset delay

let pScore     = 0;
let cScore     = 0;
let roundCount = 0; // ✅ track total rounds played
let audioUnlocked = false;
let gameOver      = false;
let isAnimating   = false;
let resetTimer    = null; // ✅ so we can cancel auto-reset if needed

// ── Cache DOM ────────────────────────────────────────────
const pEl      = document.getElementById('playerScore');
const cEl      = document.getElementById('computerScore');
const resultEl = document.getElementById('resultText');
const roundEl  = document.getElementById('roundCount'); // ✅ optional round counter element
const audio    = document.getElementById('fahAudio');
const buttons  = document.querySelectorAll('.choice-btn');

// ── Audio ────────────────────────────────────────────────
function unlockAudio() {
  if (audioUnlocked || !audio) return;
  audio.play()
    .then(() => { audio.pause(); audio.currentTime = 0; audioUnlocked = true; })
    .catch(() => {});
}

function playSound(id = 'fahAudio') {
  const sfx = id === 'fahAudio' ? audio : document.getElementById(id);
  if (!sfx) return;
  sfx.currentTime = 0;
  sfx.play().catch(() => {});
}

// ── UI Helpers ───────────────────────────────────────────
function setButtonsDisabled(state) {
  buttons.forEach(btn => (btn.disabled = state));
}

function flash(el, type) {
  el.classList.remove('flash-win', 'flash-lose');
  void el.offsetWidth;
  el.classList.add(type === 'win' ? 'flash-win' : 'flash-lose');
  setTimeout(() => el.classList.remove('flash-win', 'flash-lose'), 600);
}

function showResult(text, type) {
  resultEl.className = (type ? `${type} ` : '') + 'result-pop'; // ✅ cleaner class build
  resultEl.textContent = text;
  resultEl.addEventListener(
    'animationend',
    () => resultEl.classList.remove('result-pop'),
    { once: true }
  );
}

function highlightChoice(choice) {
  buttons.forEach(btn =>
    btn.classList.toggle('active-choice', btn.dataset.choice === choice)
  );
}

function clearHighlight() {
  buttons.forEach(btn => btn.classList.remove('active-choice'));
}

// ✅ Update round counter display
function updateRoundDisplay() {
  if (roundEl) roundEl.textContent = roundCount;
}

// ── CPU ──────────────────────────────────────────────────
function getCPUChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

// ── Score ────────────────────────────────────────────────
function updateScore(winner) {
  if (winner === 'player') {
    pEl.textContent = ++pScore;
    flash(pEl, 'win');
  } else if (winner === 'cpu') {
    cEl.textContent = ++cScore;
    flash(cEl, 'lose');
  }
}

// ── Determine Round Result ───────────────────────────────
// ✅ Pure function — easy to unit test
function getRoundResult(player, cpu) {
  if (player === cpu)          return 'tie';
  if (WINS[player] === cpu)    return 'win';
  return 'lose';
}

// ── Game Over ────────────────────────────────────────────
function checkGameOver() {
  if (pScore < MAX_SCORE && cScore < MAX_SCORE) return false;

  gameOver = true;
  setButtonsDisabled(true);

  const playerWon = pScore >= MAX_SCORE;
  showResult(
    playerWon
      ? `🎉 YOU WON! (${roundCount} rounds)`   // ✅ show rounds in end screen
      : `💀 CPU WON! (${roundCount} rounds)`,
    playerWon ? 'win' : 'lose'
  );

  // ✅ Store timer ref so resetGame() can clear it
  resetTimer = setTimeout(resetGame, RESET_MS);
  return true;
}

// ── Main Play ────────────────────────────────────────────
function play(playerChoice) {
  if (gameOver || isAnimating) return;

  unlockAudio();
  isAnimating = true;
  setButtonsDisabled(true);
  highlightChoice(playerChoice);

  const cpu    = getCPUChoice();
  const result = getRoundResult(playerChoice, cpu); // ✅ resolved early, used below

  showResult(`${EMOJIS[playerChoice]} vs ${EMOJIS[cpu]} …`, 'tie');

  setTimeout(() => {
    clearHighlight();
    roundCount++;           // ✅ increment after each completed round
    updateRoundDisplay();

    if (result === 'tie') {
      showResult(`TIE — ${EMOJIS[cpu]} ${cpu}`, 'tie');

    } else if (result === 'win') {
      updateScore('player');
      showResult(`YOU WIN — ${EMOJIS[playerChoice]} beats ${EMOJIS[cpu]}`, 'win');

    } else {
      updateScore('cpu');
      showResult(`CPU WINS — ${EMOJIS[cpu]} beats ${EMOJIS[playerChoice]}`, 'lose');
      playSound('fahAudio');
    }

    isAnimating = false;
    if (!checkGameOver()) setButtonsDisabled(false);

  }, DELAY_MS);
}

// ── Reset ────────────────────────────────────────────────
function resetGame() {
  // ✅ Cancel pending auto-reset if player resets manually
  if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }

  pScore     = 0;
  cScore     = 0;
  roundCount = 0;
  gameOver   = false;
  isAnimating = false;

  pEl.textContent = '0';
  cEl.textContent = '0';
  updateRoundDisplay();

  clearHighlight();
  setButtonsDisabled(false);
  showResult('GAME RESET — MAKE YOUR MOVE ✊🖐✌️', '');
}

// ── Init ─────────────────────────────────────────────────
window.addEventListener('load', () => {
  if (audio) audio.load();
});