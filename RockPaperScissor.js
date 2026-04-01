const CHOICES = ['Rock', 'Paper', 'Scissors'];
const EMOJIS  = { Rock: '✊', Paper: '🖐', Scissors: '✌️' };
const WINS    = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' };

let pScore = 0, cScore = 0;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  const audio = document.getElementById('fahAudio');
  audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
  audioUnlocked = true;
}

function flash(el, type) {
  el.classList.remove('flash-win', 'flash-lose');
  void el.offsetWidth;
  el.classList.add(type === 'win' ? 'flash-win' : 'flash-lose');
  setTimeout(() => el.classList.remove('flash-win', 'flash-lose'), 600);
}

function showResult(text, type) {
  const el = document.getElementById('resultText');
  el.className = type + ' result-pop';
  el.textContent = text;
  el.addEventListener('animationend', () => el.classList.remove('result-pop'), { once: true });
}

function playFah() {
  const audio = document.getElementById('fahAudio');
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function play(playerChoice) {
  unlockAudio();

  const cpu = CHOICES[Math.floor(Math.random() * 3)];
  const pEl = document.getElementById('playerScore');
  const cEl = document.getElementById('computerScore');

  if (playerChoice === cpu) {
    showResult(`TIE — both picked ${EMOJIS[cpu]} ${cpu}`, 'tie');

  } else if (WINS[playerChoice] === cpu) {
    pScore++;
    pEl.textContent = pScore;
    flash(pEl, 'win');
    showResult(`YOU WIN — ${EMOJIS[playerChoice]} beats ${EMOJIS[cpu]} ${cpu}`, 'win');

  } else {
    cScore++;
    cEl.textContent = cScore;
    flash(cEl, 'lose');
    showResult(`CPU WINS — ${EMOJIS[cpu]} ${cpu} beats ${EMOJIS[playerChoice]}`, 'lose');
    playFah();
  }
}

function resetGame() {
  pScore = cScore = 0;
  document.getElementById('playerScore').textContent  = '0';
  document.getElementById('computerScore').textContent = '0';
  showResult('GAME RESET — MAKE YOUR MOVE', '');
}

// Pre-load the audio as soon as the page is ready
window.addEventListener('load', () => {
  const audio = document.getElementById('fahAudio');
  if (audio) audio.load();
});