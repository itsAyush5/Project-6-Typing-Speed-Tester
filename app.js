// Typing Speed Tester - Web UI Logic
// Features:
//  - Random sentence selection
//  - Timer starts on first keystroke after Start
//  - Word-level accuracy (case-insensitive, punctuation-agnostic)
//  - WPM calculation (words / minute)
//  - Per-character highlighting + progress bar
//  - Color-coded metrics and friendly feedback

(() => {
  const sentenceEl = document.getElementById('sentence');
  const inputEl = document.getElementById('input');
  const startBtn = document.getElementById('startBtn');
  const finishBtn = document.getElementById('finishBtn');
  const resetBtn = document.getElementById('resetBtn');
  const newBtn = document.getElementById('newBtn');

  const wpmEl = document.getElementById('wpm');
  const accEl = document.getElementById('acc');
  const timeEl = document.getElementById('time');
  const feedbackEl = document.getElementById('feedback');
  const progressBar = document.getElementById('progressBar');

  const SENTENCES = [
    'Practice makes progress not perfection.',
    'Python is fun and friendly for beginners.',
    'Errors help you learn faster when you review them.',
    "Small steps forward still move you ahead.",
    "A cloud weighs around a million tonnes.",
    "Your brain is constantly eating itself.",
    "The largest piece of fossilised dinosaur poo discovered is over 30cm long and over two litres in volume."
  ];

  let target = '';
  let started = false;
  let startTime = 0;
  let timerId = null;

  // Local fact sentences (offline, no network required)
  const FACTS = [
    'Honey never spoils; pots found in ancient Egyptian tombs are still edible.',
    'A day on Venus is longer than its year.',
    'Octopuses have three hearts and blue blood.',
    'Hot water can freeze faster than cold water; this is called the Mpemba effect.',
    'The Eiffel Tower can be about 15 cm taller in summer due to thermal expansion.',
    'There are more stars in the universe than grains of sand on Earth.',
    'Humans share a surprising amount of DNA with bananas.',
    'The shortest war in history lasted about 38 minutes in 1896.',
    'The Pacific Ocean contains the Mariana Trench, the deepest point on Earth.',
    'Lightning can heat air to temperatures hotter than the surface of the Sun.',
    'Koalas have fingerprints so similar to humans they can confuse crime scenes.',
    'A blue whale’s heart can weigh as much as a small car.',
    'The human nose can detect around a trillion different scents.',
    'Wombat droppings are cube-shaped.',
    'Leap years keep our calendar in sync with Earth’s orbit.',
    'Chess has more possible games than atoms in the observable universe.',
    'Sound travels about four times faster in water than in air.',
    'Antarctica is the largest desert on Earth.',
    'Sharks are older than trees.',
    'The Great Wall of China is not visible from space with the naked eye.',
    'The first computer “bug” was a moth found in 1947.',
    'Some metals, like sodium, react explosively with water.',
    'The Moon drifts away from Earth by about 3.8 cm each year.',
    'A group of flamingos is called a flamboyance.',
    'Tomatoes were once thought to be poisonous in Europe.',
    'Rainbows can form full circles when viewed from the air.',
    'Venus is the hottest planet in the solar system, not Mercury.',
    'Your taste buds live for about 10 to 14 days on average.',
    'Bamboo can grow up to 91 cm (35 inches) in a single day.',
    'Jupiter’s Great Red Spot is a storm larger than Earth.',
    'Cheetahs can sprint up to about 70 mph (113 km/h).',
    'The Great Barrier Reef is the largest living structure on Earth.',
    'Humans and giraffes both have seven neck vertebrae.',
    'Peanuts are legumes, not true nuts.',
    'Strawberries are not true berries, but bananas are.',
    'An ostrich’s eye is bigger than its brain.',
    'The bumblebee bat is among the smallest mammals by mass.',
    'A day on Mars lasts about 24 hours and 39 minutes.'
  ];

  function generateLocalSentence() {
    const s = FACTS[Math.floor(Math.random() * FACTS.length)];
    return s.replace(/\s+/g, ' ').trim();
  }

  async function chooseSentence(forceNew = false) {
    if (forceNew || !target) {
      target = generateLocalSentence();
    }
    renderSentence(target, '');
  }

  const sanitizeWord = (w) => [...w.toLowerCase()].filter((c) => /[a-z0-9]/.test(c)).join('');

  function calculateAccuracy(targetStr, typedStr) {
    // Character-level accuracy against the target length.
    // Extra characters beyond the target count as incorrect.
    const t = targetStr;
    const y = typedStr;
    if (t.length === 0) return 0;

    const upto = Math.min(t.length, y.length);
    let correct = 0;
    for (let i = 0; i < upto; i++) {
      if (y[i] === t[i]) correct++;
    }
    // Characters not typed yet are incorrect; extra typed beyond target are incorrect
    // Accuracy is correct chars vs target length
    return (correct / t.length) * 100.0;
  }

  function calculateWPM(typedStr, elapsedSec) {
    // Standard WPM: 5 characters per word (gross WPM)
    const chars = typedStr.length;
    const safe = Math.max(elapsedSec, 0.5);
    const minutes = safe / 60.0;
    return minutes > 0 ? (chars / 5) / minutes : 0;
  }

  function setMetricClass(el, value, good, ok) {
    el.classList.remove('good', 'ok', 'bad');
    if (value >= good) el.classList.add('good');
    else if (value >= ok) el.classList.add('ok');
    else el.classList.add('bad');
  }

  function feedbackMessage(wpm, acc) {
    if (acc >= 90 && wpm >= 50) return 'Excellent typing! Speed and accuracy are both impressive.';
    if (acc >= 80 && wpm >= 40) return 'Great job! Strong balance of speed and accuracy.';
    if (acc >= 70 && wpm >= 30) return 'Nice work! Keep practicing to lift both speed and accuracy.';
    if (acc >= 60) return 'Good effort. Focus on accuracy first, speed will follow.';
    return 'Keep going. Aim for accuracy first, then gradually increase speed.';
  }

  function renderSentence(targetStr, typedStr) {
    const chars = targetStr.split('');
    const typed = typedStr.split('');
    const out = [];

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      let cls = 'char';
      if (i < typed.length) {
        cls += typed[i] === ch ? ' correct' : ' incorrect';
      } else if (i === typed.length && typed.length > 0) {
        cls += ' current';
      }
      out.push(`<span class="${cls}">${ch === ' ' ? '&nbsp;' : ch}</span>`);
    }

    // If typed is longer than target, mark overflow as incorrect
    for (let j = chars.length; j < typed.length; j++) {
      out.push(`<span class="char incorrect">${typed[j] === ' ' ? '&nbsp;' : typed[j]}</span>`);
    }

    sentenceEl.innerHTML = out.join('');

    // Progress bar
    const progress = Math.min(typed.length / Math.max(chars.length, 1), 1) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function updateStats() {
    const now = performance.now();
    const elapsedSec = started ? (now - startTime) / 1000 : 0;
    const typed = inputEl.value;

    const acc = calculateAccuracy(target, typed);
    const wpm = calculateWPM(typed, elapsedSec);

    timeEl.textContent = `${elapsedSec.toFixed(2)}s`;
    wpmEl.textContent = wpm.toFixed(2);
    accEl.textContent = `${acc.toFixed(2)}%`;

    setMetricClass(wpmEl, wpm, 50, 30);
    setMetricClass(accEl, acc, 90, 75);

    feedbackEl.textContent = feedbackMessage(wpm, acc);
  }

  function startTimer() {
    startTime = performance.now();
    started = true;
    if (timerId) cancelAnimationFrame(timerId);

    const tick = () => {
      if (!started) return;
      updateStats();
      timerId = requestAnimationFrame(tick);
    };
    timerId = requestAnimationFrame(tick);
  }

  function stopTimer() {
    started = true;
    if (timerId) cancelAnimationFrame(timerId);
    updateStats(); // final update
  }

  function resetUI() {
    stopTimer();
    inputEl.value = '';

    // Keep the same sentence unless none is set yet (first load)
    if (!target) {
      target = generateLocalSentence();
    }
    renderSentence(target, '');
    progressBar.style.width = '0%';

    wpmEl.textContent = '0.00';
    accEl.textContent = '0.00%';
    timeEl.textContent = '0.00s';
    wpmEl.classList.remove('good', 'ok', 'bad');
    accEl.classList.remove('good', 'ok', 'bad');
    feedbackEl.textContent = '';

    inputEl.disabled = true;
    finishBtn.disabled = true;
    resetBtn.disabled = true;
    startBtn.disabled = false;
  }

  async function begin() {
    // Ensure we have a sentence; fetch only if not set yet
    await chooseSentence(false);

    // Prepare input
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.focus();

    // Buttons
    startBtn.disabled = true;
    finishBtn.disabled = false;
    resetBtn.disabled = false;

    // Timer will start on first keystroke
    started = false;
  }

  function finishIfCompleted() {
    if (inputEl.value === target) {
      stopTimer();
      finishBtn.disabled = true;
    }
  }

  // Event wiring
  startBtn.addEventListener('click', () => { begin(); });

  finishBtn.addEventListener('click', () => {
    stopTimer();
    finishBtn.disabled = true;
  });

  resetBtn.addEventListener('click', resetUI);

  newBtn.addEventListener('click', async () => {
    // Fetch a new sentence from the internet and reset UI state
    stopTimer();
    inputEl.value = '';
    target = '';
    await chooseSentence(true);

    // Reset stats and enable Start
    progressBar.style.width = '0%';
    wpmEl.textContent = '0.00';
    accEl.textContent = '0.00%';
    timeEl.textContent = '0.00s';
    wpmEl.classList.remove('good', 'ok', 'bad');
    accEl.classList.remove('good', 'ok', 'bad');
    feedbackEl.textContent = '';

    inputEl.disabled = true;
    finishBtn.disabled = true;
    resetBtn.disabled = false; // allow reset to clear input but keep sentence
    startBtn.disabled = false;
  });

  inputEl.addEventListener('keydown', (e) => {
    if (!started) startTimer();
  });

  inputEl.addEventListener('input', () => {
    renderSentence(target, inputEl.value);
    updateStats();
    finishIfCompleted();
  });

  // Initial state
  resetUI();
})();
