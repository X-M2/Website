// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

navToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- Weather system (shared by hero picker AND the live chatbot) ----------
// applyWeather() is the single source of truth for "what does the site look like
// for this weather state" — the manual picker buttons and the real Botpress
// classification both call the exact same function, so they can never drift
// out of sync with each other.

const forecastCard = document.getElementById("forecastCard");
const forecastIcon = document.getElementById("forecastIcon");
const forecastCaption = document.getElementById("forecastCaption");
const pickerButtons = document.querySelectorAll(".picker-btn");

const weatherData = {
  sunny: {
    caption: "Clear skies. Good day to get ahead of things.",
    icon: `<svg viewBox="0 0 200 160" class="icon-sketch">
      <circle cx="100" cy="80" r="34" fill="none" stroke="currentColor" stroke-width="3.5"/>
      <path d="M100 26 L100 12 M148 40 L158 30 M52 40 L42 30 M100 134 L100 148 M148 120 L158 130 M52 120 L42 130 M40 80 L26 80 M160 80 L174 80"
            fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`
  },
  cloudy: {
    caption: "Overcast, chance of deadlines later.",
    icon: `<svg viewBox="0 0 200 160" class="icon-sketch">
      <path d="M46 118 C24 118 14 100 28 86 C22 64 46 48 66 56 C74 34 112 30 124 52 C150 50 168 70 158 92 C172 96 172 118 152 120 Z"
            fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  stormy: {
    caption: "Rough front moving through. It'll pass.",
    icon: `<svg viewBox="0 0 200 160" class="icon-sketch">
      <path d="M46 96 C24 96 14 78 28 64 C22 42 46 26 66 34 C74 12 112 8 124 30 C150 28 168 48 158 70 C172 74 172 96 152 98 Z"
            fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M104 100 L86 130 L104 130 L92 152" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  clearing: {
    caption: "Skies opening up. Nearly through this one.",
    icon: `<svg viewBox="0 0 200 160" class="icon-sketch">
      <circle cx="130" cy="58" r="26" fill="none" stroke="currentColor" stroke-width="3.5"/>
      <path d="M40 118 C18 118 8 100 22 86 C16 64 40 48 60 56 C68 38 96 34 110 50"
            fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }
};

function applyWeather(key) {
  const data = weatherData[key];
  if (!data) return;

  // Hero card state (icon color etc.)
  forecastCard.className = "forecast-card state-" + key;

  // Subtle whole-page tint — background wash only, text stays readable
  document.body.className = "theme-" + key;

  // Update icon + caption
  forecastIcon.innerHTML = data.icon;
  forecastCaption.textContent = data.caption;

  // Sync the picker buttons' pressed state too, so if the bot changes the
  // weather, the matching button visually shows as "active" as well
  pickerButtons.forEach((b) => {
    const match = b.dataset.weather === key;
    b.classList.toggle("active", match);
    b.setAttribute("aria-pressed", match ? "true" : "false");
  });
}

// Manual picker buttons (hero) — a quick local preview, no AI involved
pickerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    applyWeather(btn.dataset.weather);
  });
});

// ---------- Live weather updates from the Botpress chatbot ----------
// The bot's flow sends a "Send Custom Event" card after classifying the
// student's mood, with a payload like: {"action":"weather_update","weather":"stormy"}
// This listens for that and calls the exact same applyWeather() function
// above — so a real conversation genuinely changes the site's mood, not
// just the manual demo buttons.

if (window.botpress && typeof window.botpress.on === "function") {
  window.botpress.on("customEvent", (event) => {
    if (event && event.action === "weather_update" && event.weather) {
      applyWeather(event.weather);
    }
  });
}

// ---------- Interactive breathing exercise (Library section) ----------
// A real 30-second guided cycle, synced to the CSS ring animation (6s per breath).
// Phases: inhale (0-2.4s), hold (2.4-3.6s), exhale (3.6-6s) — matches the
// scale keyframes in style.css (40%/60% hold plateau on a 6s loop).

const breathingRing = document.getElementById("libraryRing");
const breathingLabelEl = document.getElementById("libraryRingLabel");
const breathingToggle = document.getElementById("breathingToggle");

let breathingTimer = null;
let breathingPhaseTimer = null;
let breathingActive = false;

function runBreathingPhaseCycle() {
  const phases = [
    { text: "Breathe in", duration: 2400 },
    { text: "Hold", duration: 1200 },
    { text: "Breathe out", duration: 2400 }
  ];
  let i = 0;

  function nextPhase() {
    if (!breathingActive) return;
    breathingLabelEl.textContent = phases[i].text;
    breathingPhaseTimer = setTimeout(() => {
      i = (i + 1) % phases.length;
      nextPhase();
    }, phases[i].duration);
  }
  nextPhase();
}

function startBreathing() {
  breathingActive = true;
  breathingRing.classList.add("active");
  breathingToggle.textContent = "Stop";
  runBreathingPhaseCycle();

  // Auto-stop after 30 seconds
  breathingTimer = setTimeout(stopBreathing, 30000);
}

function stopBreathing() {
  breathingActive = false;
  breathingRing.classList.remove("active");
  breathingLabelEl.textContent = "Ready";
  breathingToggle.textContent = "Try 30 seconds";
  clearTimeout(breathingTimer);
  clearTimeout(breathingPhaseTimer);
}

if (breathingToggle) {
  breathingToggle.addEventListener("click", () => {
    if (breathingActive) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });
}

// ---------- Shoulders & jaw release (click-through steps) ----------

const releaseStepText = document.getElementById("releaseStepText");
const releaseDots = document.querySelectorAll("#releaseDots .release-dot");
const releaseNextBtn = document.getElementById("releaseNextBtn");
const zoneShoulders = document.querySelectorAll(".zone-shoulders");
const zoneJaw = document.querySelectorAll(".zone-jaw");
const zoneHands = document.querySelectorAll(".zone-hands");

const releaseSteps = [
  {
    text: "Drop your shoulders away from your ears. Hold for 3 seconds, then let go.",
    zones: zoneShoulders
  },
  {
    text: "Unclench your jaw. Let your tongue rest gently behind your teeth.",
    zones: zoneJaw
  },
  {
    text: "Shake out your hands. Notice the difference?",
    zones: zoneHands
  }
];

let releaseStepIndex = -1;

function clearAllZones() {
  [...zoneShoulders, ...zoneJaw, ...zoneHands].forEach((z) => (z.style.opacity = 0));
}

function showReleaseStep(index) {
  clearAllZones();
  releaseDots.forEach((d, i) => d.classList.toggle("active", i === index));

  const step = releaseSteps[index];
  releaseStepText.textContent = step.text;
  step.zones.forEach((z) => (z.style.opacity = 1));
}

if (releaseNextBtn) {
  releaseNextBtn.addEventListener("click", () => {
    releaseStepIndex++;

    if (releaseStepIndex >= releaseSteps.length) {
      // Reset back to start
      releaseStepIndex = -1;
      clearAllZones();
      releaseDots.forEach((d) => d.classList.remove("active"));
      releaseStepText.textContent = "Ready when you are.";
      releaseNextBtn.textContent = "Start";
      return;
    }

    showReleaseStep(releaseStepIndex);
    releaseNextBtn.textContent =
      releaseStepIndex === releaseSteps.length - 1 ? "Done" : "Next";
  });
}

// ---------- Before you present (60s countdown) ----------

const countdownNumber = document.getElementById("countdownNumber");
const countdownLine = document.getElementById("countdownLine");
const countdownToggle = document.getElementById("countdownToggle");

const countdownLines = [
  { at: 60, text: "Shake out your hands." },
  { at: 45, text: "Roll your shoulders back." },
  { at: 30, text: "Take one slow breath." },
  { at: 15, text: "You know this material." },
  { at: 5, text: "Almost time. You've got this." }
];

let countdownInterval = null;
let countdownValue = 60;
let countdownActive = false;

function updateCountdownLine(value) {
  const match = [...countdownLines].reverse().find((l) => value <= l.at);
  if (match) countdownLine.textContent = match.text;
}

function startCountdown() {
  countdownActive = true;
  countdownValue = 60;
  countdownNumber.textContent = countdownValue;
  updateCountdownLine(countdownValue);
  countdownToggle.textContent = "Stop";

  countdownInterval = setInterval(() => {
    countdownValue--;
    countdownNumber.textContent = countdownValue;
    updateCountdownLine(countdownValue);

    if (countdownValue <= 0) {
      countdownLine.textContent = "Go get 'em.";
      stopCountdown();
    }
  }, 1000);
}

function stopCountdown() {
  countdownActive = false;
  clearInterval(countdownInterval);
  countdownToggle.textContent = "Start 60s";
}

if (countdownToggle) {
  countdownToggle.addEventListener("click", () => {
    if (countdownActive) {
      stopCountdown();
      countdownNumber.textContent = "60";
      countdownLine.textContent = "Shake out your hands.";
    } else {
      startCountdown();
    }
  });
}
