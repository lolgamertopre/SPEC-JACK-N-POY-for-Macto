const CHOICES = ['Rock', 'Paper', 'Scissors'];
const EMOJIS  = { Rock: '✊', Paper: '🖐', Scissors: '✌️' };
const WINS    = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' };

const MAX_SCORE = 5;
const DELAY_MS  = 480;
const RESET_MS  = 2800;

let pScore = 0, cScore = 0, roundCount = 0;
let playerStreak = 0, cpuStreak = 0;
let gameOver = false, isAnimating = false, resetTimer = null;
let audioUnlocked = false;

// ✅ Track player's move history to power smarter CPU
let playerHistory = { Rock: 0, Paper: 0, Scissors: 0 };

// ── DOM ──────────────────────────────────────────────────
const pEl           = document.getElementById('playerScore');
const cEl           = document.getElementById('computerScore');
const resultEl      = document.getElementById('resultText');
const progressFill  = document.getElementById('progressFill');
const streakRow     = document.getElementById('streakRow');
const audio         = document.getElementById('fahAudio');
const buttons       = document.querySelectorAll('.choice-btn');
const overlay       = document.getElementById('gameoverOverlay');
const gameoverTitle = document.getElementById('gameoverTitle');
const gameoverSub   = document.getElementById('gameoverSub');

// ── Audio ────────────────────────────────────────────────
function unlockAudio() {
  if (audioUnlocked || !audio) return;
  audio.play().then(() => { audio.pause(); audio.currentTime = 0; audioUnlocked = true; }).catch(() => {});
}
function playSound() {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// ── UI helpers ───────────────────────────────────────────
function setButtonsDisabled(state) { buttons.forEach(b => b.disabled = state); }

function flash(el, type) {
  el.classList.remove('flash-win', 'flash-lose');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add(type === 'win' ? 'flash-win' : 'flash-lose');
  setTimeout(() => el.classList.remove('flash-win', 'flash-lose'), 550);
}

function showResult(text, type) {
  resultEl.className = (type ? `${type} ` : '') + 'result-pop';
  resultEl.textContent = text;
  resultEl.addEventListener('animationend', () => resultEl.classList.remove('result-pop'), { once: true });
}

function highlightChoice(choice) {
  buttons.forEach(b => b.classList.toggle('active-choice', b.dataset.choice === choice));
}
function clearHighlight() { buttons.forEach(b => b.classList.remove('active-choice')); }

// ✅ Progress bar: driven by the leading score
function updateProgress() {
  const pct = Math.max(pScore, cScore) / MAX_SCORE * 100;
  progressFill.style.width = pct + '%';
}

// ✅ Streak badge: show when either side is on 2+ wins in a row
function updateStreak() {
  streakRow.innerHTML = '';
  if (playerStreak >= 2) {
    const b = document.createElement('span');
    b.className = 'streak-badge player';
    b.textContent = `🔥 ${playerStreak}-win streak`;
    streakRow.appendChild(b);
  } else if (cpuStreak >= 2) {
    const b = document.createElement('span');
    b.className = 'streak-badge cpu';
    b.textContent = `💀 CPU on ${cpuStreak}-win run`;
    streakRow.appendChild(b);
  }
}

// ── CPU ──────────────────────────────────────────────────
// ✅ Adaptive CPU: after 3 rounds, counters the player's most frequent pick 60% of the time
function getCPUChoice() {
  if (roundCount < 3) return CHOICES[Math.floor(Math.random() * 3)];
  if (Math.random() > 0.6) return CHOICES[Math.floor(Math.random() * 3)];
  const fav = Object.entries(playerHistory).sort((a, b) => b[1] - a[1])[0][0];
  return Object.keys(WINS).find(k => WINS[k] === fav);
}

// ── Logic ────────────────────────────────────────────────
function getRoundResult(player, cpu) {
  if (player === cpu)       return 'tie';
  if (WINS[player] === cpu) return 'win';
  return 'lose';
}

// ✅ Confetti burst on player win
function spawnConfetti() {
  const colors = ['#e8ff47', '#47c5ff', '#ff4747', '#ffffff', '#ff47c5'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = [
      `left:${Math.random() * 100}vw`,
      `top:0`,
      `background:${colors[i % colors.length]}`,
      `width:${6 + Math.random() * 6}px`,
      `height:${6 + Math.random() * 6}px`,
      `animation-duration:${1.5 + Math.random() * 2}s`,
      `animation-delay:${Math.random() * 0.6}s`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

function updateScore(winner) {
  if (winner === 'player') {
    pEl.textContent = ++pScore;
    flash(pEl, 'win');
    playerStreak++; cpuStreak = 0;
  } else {
    cEl.textContent = ++cScore;
    flash(cEl, 'lose');
    cpuStreak++; playerStreak = 0;
  }
  updateProgress();
  updateStreak();
}

function checkGameOver() {
  if (pScore < MAX_SCORE && cScore < MAX_SCORE) return false;
  gameOver = true;
  setButtonsDisabled(true);
  const won = pScore >= MAX_SCORE;
  gameoverTitle.textContent = won ? '🎉 YOU WIN!' : '💀 CPU WINS';
  gameoverTitle.style.color = won ? 'var(--accent)' : 'var(--red)';
  gameoverSub.textContent   = `${roundCount} rounds played · Auto-reset in 3s`;
  overlay.classList.add('show');
  if (won) spawnConfetti();
  resetTimer = setTimeout(resetGame, RESET_MS);
  return true;
}

// ── Main play ────────────────────────────────────────────
function play(playerChoice) {
  if (gameOver || isAnimating) return;
  unlockAudio();
  isAnimating = true;
  setButtonsDisabled(true);
  highlightChoice(playerChoice);
  playerHistory[playerChoice]++; // ✅ feed the adaptive CPU

  const cpu    = getCPUChoice();
  const result = getRoundResult(playerChoice, cpu);

  showResult(`${EMOJIS[playerChoice]} vs ${EMOJIS[cpu]} …`, 'tie');

  setTimeout(() => {
    clearHighlight();
    roundCount++;

    if (result === 'tie') {
      playerStreak = cpuStreak = 0;
      updateStreak();
      showResult(`TIE — ${EMOJIS[cpu]} ${cpu}`, 'tie');
    } else if (result === 'win') {
      updateScore('player');
      showResult(`YOU WIN — ${EMOJIS[playerChoice]} beats ${EMOJIS[cpu]}`, 'win');
    } else {
      updateScore('cpu');
      showResult(`CPU WINS — ${EMOJIS[cpu]} beats ${EMOJIS[playerChoice]}`, 'lose');
      playSound();
    }

    isAnimating = false;
    if (!checkGameOver()) setButtonsDisabled(false);
  }, DELAY_MS);
}

// ── Reset ────────────────────────────────────────────────
function resetGame() {
  if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }
  pScore = cScore = roundCount = playerStreak = cpuStreak = 0;
  playerHistory = { Rock: 0, Paper: 0, Scissors: 0 };
  gameOver = isAnimating = false;
  pEl.textContent = cEl.textContent = '0';
  pEl.style.color = cEl.style.color = '';
  progressFill.style.width = '0%';
  streakRow.innerHTML = '';
  overlay.classList.remove('show');
  clearHighlight();
  setButtonsDisabled(false);
  showResult('Game reset — make your move ✊🖐✌️', '');
}

// ── Keyboard shortcuts ───────────────────────────────────
// ✅ R = Rock, P = Paper, S = Scissors
document.addEventListener('keydown', e => {
  if (gameOver || isAnimating) return;
  const map = { r: 'Rock', p: 'Paper', s: 'Scissors' };
  const choice = map[e.key.toLowerCase()];
  if (choice) play(choice);
});

// ── Init ─────────────────────────────────────────────────
window.addEventListener('load', () => { if (audio) audio.load(); });