const themeToggle = document.querySelector('.theme-toggle');
const simulateButton = document.querySelector('#simulate-button');
const liveModeButton = document.querySelector('#live-mode-button');
const readingDisplay = document.querySelector('#reading-display');
const temperatureValue = document.querySelector('.temperature-value');
const readingStatus = document.querySelector('.reading-status');
const timestamp = document.querySelector('.timestamp');
const historyList = document.querySelector('#reading-history');
const currentYear = document.querySelector('#current-year');
const constellationCanvas = document.querySelector('#constellation-canvas');
const hero = document.querySelector('.hero');
const networkNodes = document.querySelectorAll('.network-node');
const revealItems = document.querySelectorAll('.reveal');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const themeStorageKey = 'iot-club-theme';
const readings = [];
let liveModeInterval = null;
let redrawConstellation = () => {};

// Applies the selected theme and updates the accessible toggle state.
const applyTheme = (isDark) => {
  document.body.classList.toggle('dark', isDark);

  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.innerHTML = isDark
      ? '<span aria-hidden="true">☀️</span> Light'
      : '<span aria-hidden="true">🌙</span> Dark';
  }

  redrawConstellation();
};

// Reads the saved theme, or uses the visitor's system theme as a fallback.
const loadThemePreference = () => {
  const savedTheme = localStorage.getItem(themeStorageKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);
};

// Sets a friendly state while the simulated sensor is working.
const showReadingInProgress = () => {
  if (!temperatureValue || !readingStatus || !timestamp) return;

  temperatureValue.textContent = '-- °C';
  readingStatus.textContent = 'Reading sensor…';
  readingStatus.className = 'reading-status';
  timestamp.textContent = 'Just a moment.';
};

// Returns the label and CSS class that fit a temperature value.
const getTemperatureStatus = (temperature) => {
  if (temperature < 20) return { label: 'Cool', className: 'status-cool' };
  if (temperature <= 30) return { label: 'Normal', className: 'status-normal' };
  return { label: 'Hot', className: 'status-hot' };
};

// Shows the last five saved readings with the newest one first.
const renderHistory = () => {
  if (!historyList) return;

  if (!readings.length) {
    historyList.innerHTML = '<li>No readings saved yet.</li>';
    return;
  }

  historyList.innerHTML = readings
    .map((reading) => `<li><strong>${reading.value} °C</strong> <span>at ${reading.time}</span></li>`)
    .join('');
};

// Generates, displays, and saves a simulated temperature reading.
const takeReading = () => {
  if (!simulateButton || !temperatureValue || !readingStatus || !timestamp) return;
  if (simulateButton.disabled) return;

  simulateButton.disabled = true;
  showReadingInProgress();

  window.setTimeout(() => {
    const temperature = Number((Math.random() * 25 + 15).toFixed(1));
    const time = new Date().toLocaleTimeString();
    const status = getTemperatureStatus(temperature);

    temperatureValue.textContent = `${temperature.toFixed(1)} °C`;
    readingStatus.textContent = status.label;
    readingStatus.className = `reading-status ${status.className}`;
    timestamp.textContent = `Last updated: ${time}`;
    readings.unshift({ value: temperature.toFixed(1), time });
    readings.splice(5);
    renderHistory();
    simulateButton.disabled = false;
  }, 600);
};

// Starts or stops automatic temperature readings without duplicate timers.
const toggleLiveMode = () => {
  if (!liveModeButton) return;

  if (liveModeInterval) {
    window.clearInterval(liveModeInterval);
    liveModeInterval = null;
    liveModeButton.textContent = 'Start Live Mode';
    liveModeButton.setAttribute('aria-pressed', 'false');
    return;
  }

  takeReading();
  liveModeInterval = window.setInterval(takeReading, 2000);
  liveModeButton.textContent = 'Stop Live Mode';
  liveModeButton.setAttribute('aria-pressed', 'true');
};

// Keeps the footer year current without requiring an annual edit.
const updateCurrentYear = () => {
  if (!currentYear) return;

  currentYear.textContent = String(new Date().getFullYear());
};

// Draws the data routes between the hero's Internet hub and connected home devices.
const setupConstellation = () => {
  if (!constellationCanvas || !hero || !networkNodes.length) return;

  const context = constellationCanvas.getContext('2d');
  if (!context) return;

  let animationFrame = null;
  let width = 0;
  let height = 0;
  let stars = [];

  // Scatters quiet stars to give the network its constellation atmosphere.
  const buildStars = () => {
    const starCount = Math.max(28, Math.round((width * height) / 21000));
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.15 + .25,
      phase: Math.random() * Math.PI * 2
    }));
  };

  // Fits the canvas to its hero without stretching its drawing pixels.
  const resizeCanvas = () => {
    const bounds = hero.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    constellationCanvas.width = Math.round(width * pixelRatio);
    constellationCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    buildStars();
  };

  // Finds each map node in canvas coordinates after CSS has positioned it.
  const getNodeCenters = () => {
    const heroBounds = hero.getBoundingClientRect();

    return Array.from(networkNodes).map((node) => {
      const bounds = node.getBoundingClientRect();
      return {
        node,
        x: bounds.left - heroBounds.left + bounds.width / 2,
        y: bounds.top - heroBounds.top + bounds.height / 2
      };
    });
  };

  // Draws curved signal paths and a small moving pulse for every connected device.
  const drawFrame = (time = 0) => {
    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    const centers = getNodeCenters();
    const internet = centers.find(({ node }) => node.classList.contains('internet-core'));
    context.clearRect(0, 0, width, height);

    if (!internet) return;

    stars.forEach((star) => {
      const drift = Math.sin(time / 1800 + star.phase) * 2;
      context.beginPath();
      context.globalAlpha = .16 + Math.sin(time / 1100 + star.phase) * .08;
      context.fillStyle = accent;
      context.arc(star.x + drift, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    centers.forEach((device, index) => {
      if (device.node === internet.node) return;

      const direction = index % 2 === 0 ? 1 : -1;
      const bend = Math.min(64, Math.hypot(device.x - internet.x, device.y - internet.y) * .18) * direction;
      const controlX = (internet.x + device.x) / 2 + bend;
      const controlY = (internet.y + device.y) / 2 - bend;
      context.beginPath();
      context.globalAlpha = .2;
      context.strokeStyle = accent;
      context.lineWidth = 1;
      context.moveTo(internet.x, internet.y);
      context.quadraticCurveTo(controlX, controlY, device.x, device.y);
      context.stroke();

      const progress = (time / 1800 + index * .16) % 1;
      const remaining = 1 - progress;
      const pulseX = remaining ** 2 * internet.x + 2 * remaining * progress * controlX + progress ** 2 * device.x;
      const pulseY = remaining ** 2 * internet.y + 2 * remaining * progress * controlY + progress ** 2 * device.y;
      context.beginPath();
      context.globalAlpha = .95;
      context.fillStyle = accent;
      context.shadowBlur = 10;
      context.shadowColor = accent;
      context.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    });

    context.globalAlpha = 1;
  };

  // Keeps signal pulses moving while the user permits motion.
  const animate = (time) => {
    drawFrame(time);
    animationFrame = window.requestAnimationFrame(animate);
  };

  // Restarts or pauses motion when the operating-system preference changes.
  const updateMotionPreference = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    drawFrame();
    if (!motionQuery.matches) animationFrame = window.requestAnimationFrame(animate);
  };

  redrawConstellation = () => drawFrame();
  resizeCanvas();
  updateMotionPreference();

  window.addEventListener('resize', () => {
    resizeCanvas();
    drawFrame();
  });

  motionQuery.addEventListener('change', updateMotionPreference);
};

// Reveals content as it enters the viewport without hiding it when motion is reduced.
const setupScrollReveals = () => {
  if (!revealItems.length) return;

  if (motionQuery.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  document.body.classList.add('reveal-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });

  revealItems.forEach((item) => observer.observe(item));
};

loadThemePreference();
updateCurrentYear();
setupConstellation();
setupScrollReveals();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    applyTheme(isDark);
    localStorage.setItem(themeStorageKey, isDark ? 'dark' : 'light');
  });
}

if (simulateButton) simulateButton.addEventListener('click', takeReading);
if (liveModeButton) liveModeButton.addEventListener('click', toggleLiveMode);
