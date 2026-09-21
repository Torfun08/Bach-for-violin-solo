const { Chord, Scale } = Tonal;

const resultEl = document.getElementById('result');
const scaleResultEl = document.getElementById('scaleResult');

document.getElementById('chordInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') showChord();
});

function showChord(name) {
  const chordName = name || document.getElementById('chordInput').value.trim();
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

showChord('F#M');
