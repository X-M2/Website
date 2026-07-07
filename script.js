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

// ---------- Weather picker (hero) ----------
// Purely local/client-side — swaps a hand-sketched icon + caption.
// No AI or backend involved; this is just a preview interaction.

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

pickerButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.weather;
    const data = weatherData[key];
    if (!data) return;

    // Update card state class for color theming
    forecastCard.className = "forecast-card state-" + key;

    // Subtle whole-page tint (Option A) — just a background wash,
    // text/nav/sections all stay exactly as they are
    document.body.className = "theme-" + key;

    // Update icon + caption
    forecastIcon.innerHTML = data.icon;
    forecastCaption.textContent = data.caption;

    // Update pressed state on buttons
    pickerButtons.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
  });
});

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
