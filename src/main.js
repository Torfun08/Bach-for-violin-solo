const { Chord, Scale } = Tonal;

const resultEl = document.getElementById('result');
const scaleResultEl = document.getElementById('scaleResult');
const earResultEl = document.getElementById('earResult');
const scoreEl = document.getElementById('score');

// ── Web Audio API (iOS needs resume in user gesture) ──
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function playNote(freq, startTime, duration = 0.5) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.25, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(startTime); osc.stop(startTime + duration);
}

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const BASE_FREQ = 261.63; // C4

function noteToFreq(note) {
  const i = NOTE_NAMES.indexOf(note);
  return i === -1 ? null : BASE_FREQ * Math.pow(2, i / 12);
}

// ── Chord & Scale ──

document.getElementById('chordBtn').addEventListener('click', showChord);
document.getElementById('chordInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') showChord();
});
document.getElementById('scaleBtn').addEventListener('click', showScale);

function showChord() {
  const chordName = document.getElementById('chordInput').value.trim();
  if (!chordName) { resultEl.textContent = 'Enter a chord name'; return; }
  try {
    const chord = Chord.get(chordName);
    if (!chord.notes || !chord.notes.length) { resultEl.textContent = `Unknown chord: ${chordName}`; return; }
    resultEl.innerHTML = `<b>${chord.name || chordName}</b><br>Notes: <b>${chord.notes.join(' &bull; ')}</b><br>Intervals: ${chord.intervals.join(', ')}`;
  } catch (err) {
    resultEl.textContent = `Error: ${err.message}`;
  }
}

function showScale() {
  const key = document.getElementById('scaleKey').value;
  const type = document.getElementById('scaleType').value;
  try {
    const scale = Scale.get(`${key} ${type}`);
    if (!scale.notes || !scale.notes.length) { scaleResultEl.textContent = `Unknown scale: ${key} ${type}`; return; }
    scaleResultEl.innerHTML = `<b>${key} ${type}</b><br>Notes: <b>${scale.notes.join(' &bull; ')}</b>`;
  } catch (err) {
    scaleResultEl.textContent = `Error: ${err.message}`;
  }
}

// ── Ear Training ──
const INTERVALS = ['m2','M2','m3','M3','P4','A4','P5','m6','M6','m7','M7','P8'];
const INTERVAL_SEMITONES = { m2:1, M2:2, m3:3, M3:4, P4:5, A4:6, P5:7, m6:8, M6:9, m7:10, M7:11, P8:12 };

let correct = 0;
let total = 0;
let lastCorrectAnswer = null;

document.getElementById('playBtn').addEventListener('click', () => {
  const sel = document.getElementById('intSel').value;
  if (!sel) { earResultEl.textContent = 'เลือก interval ก่อน'; return; }
  playIntervalPair(sel);
});

document.getElementById('quizBtn').addEventListener('click', () => {
  const sel = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
  document.getElementById('intSel').value = sel;
  playIntervalPair(sel);
  lastCorrectAnswer = sel;
});

function playIntervalPair(interval) {
  const semitones = INTERVAL_SEMITONES[interval];
  const f1 = noteToFreq('C');
  const f2 = noteToFreq(NOTE_NAMES[semitones % 12]);
  if (!f1 || !f2) return;
  const t = audioCtx.currentTime;
  playNote(f1, t, 0.5);
  playNote(f2, t + 0.65, 0.5);
  earResultEl.textContent = `🎵 เล่น ${interval} แล้ว — ตอบที่นี่:`;
  // Add an input for typing the answer
  if (!document.getElementById('answerInput')) {
    const input = document.createElement('input');
    input.id = 'answerInput';
    input.placeholder = 'เช่น M3, P5';
    input.style.cssText = 'padding:8px 12px;border-radius:8px;border:1px solid var(--gold);background:rgba(0,0,0,.3);color:var(--cream);font-family:Georgia,serif;margin-top:8px;';
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkAnswer(); });
    const btn = document.createElement('button');
    btn.textContent = 'Submit';
    btn.id = 'answerBtn';
    btn.style.cssText = 'margin-top:8px;padding:8px 16px;';
    btn.addEventListener('click', checkAnswer);
    earResultEl.appendChild(input);
    earResultEl.appendChild(btn);
  }
}

function checkAnswer() {
  const input = document.getElementById('answerInput');
  if (!input) return;
  const ans = input.value.trim();
  if (lastCorrectAnswer && ans === lastCorrectAnswer) {
    correct++;
    earResultEl.innerHTML = `<b style="color:#4ade80">✅ ถูกต้อง! ตอบ ${lastCorrectAnswer}</b>`;
  } else {
    earResultEl.innerHTML = `<b style="color:#f87171">❌ ไม่ถูกต้อง — คำตอบคือ ${lastCorrectAnswer}</b>`;
  }
  total++;
  scoreEl.textContent = `Score: ${correct}/${total}`;
  lastCorrectAnswer = null;
  const inp = document.getElementById('answerInput');
  if (inp) inp.remove();
  const btn = document.getElementById('answerBtn');
  if (btn) btn.remove();
}

showChord('F#M');
