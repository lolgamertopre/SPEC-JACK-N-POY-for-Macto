const CHOICES = ['Rock', 'Paper', 'Scissors'];
const EMOJIS  = { Rock: '✊', Paper: '🖐', Scissors: '✌️' };
const WINS    = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' };
 
let pScore = 0, cScore = 0;
let audioUnlocked = false;
 
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
function unlockAudio() {
  if (audioUnlocked) return;
  const audio = document.getElementById('fahAudio');
  audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
  audioUnlocked = true;
}
function playFah() {
  const audio = document.getElementById('fahAudio');
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}