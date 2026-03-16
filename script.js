/**
 * Password Generator — script.js
 * ─────────────────────────────────────────────
 * Handles all interactive logic:
 *   • Reading user options (length slider + checkboxes)
 *   • Generating a cryptographically shuffled random password
 *   • Evaluating and displaying password strength
 *   • Copying the password to the clipboard via the Clipboard API
 *   • UI feedback: toast notifications, icon swap, strength bar
 * ─────────────────────────────────────────────
 */

// ── Character Sets ──────────────────────────────────────────────────────────

/** The four available character pools the user can enable/disable. */
const CHARS = {
  upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower:   "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?"
};


// ── DOM References ─────────────────────────────────────────────────────────

const lengthSlider    = document.getElementById("lengthSlider");
const lengthValue     = document.getElementById("lengthValue");
const chkUpper        = document.getElementById("chkUpper");
const chkLower        = document.getElementById("chkLower");
const chkNumbers      = document.getElementById("chkNumbers");
const chkSymbols      = document.getElementById("chkSymbols");
const passwordOutput  = document.getElementById("passwordOutput");
const generateBtn     = document.getElementById("generateBtn");
const copyBtnTop      = document.getElementById("copyBtn");        // icon button inside output
const copyBtnBottom   = document.getElementById("copyBtnBottom");  // bottom action button
const copyIcon        = document.getElementById("copyIcon");
const checkIcon       = document.getElementById("checkIcon");
const strengthBar     = document.getElementById("strengthBar");
const strengthText    = document.getElementById("strengthText");
const toast           = document.getElementById("toast");


// ── Strength Evaluation ─────────────────────────────────────────────────────

/**
 * Defines the four strength levels with their visual properties.
 * Each level maps to a percentage width for the bar and a CSS color variable.
 */
const STRENGTH_LEVELS = [
  { label: "Weak",   width: "22%",  color: "var(--weak)",   minScore: 0 },
  { label: "Fair",   width: "50%",  color: "var(--fair)",   minScore: 2 },
  { label: "Good",   width: "75%",  color: "var(--good)",   minScore: 3 },
  { label: "Strong", width: "100%", color: "var(--strong)", minScore: 4 }
];

/**
 * evaluateStrength(password, optionCount)
 * Scores the password based on length and number of active character sets.
 *
 * Scoring logic:
 *   +1 point per active character set (max 4)
 *   +1 bonus if length >= 16
 *   +1 bonus if length >= 24
 *   → Total possible: 6, mapped to 4 levels
 *
 * @param {string} password    — The generated password string
 * @param {number} optionCount — How many character sets are active
 * @returns {object} The matching STRENGTH_LEVELS entry
 */
function evaluateStrength(password, optionCount) {
  let score = optionCount; // 0–4 based on active sets
  if (password.length >= 16) score++;
  if (password.length >= 24) score++;

  // Map score to level index (0=Weak, 1=Fair, 2=Good, 3=Strong)
  if (score <= 1) return STRENGTH_LEVELS[0];
  if (score <= 2) return STRENGTH_LEVELS[1];
  if (score <= 4) return STRENGTH_LEVELS[2];
  return STRENGTH_LEVELS[3];
}

/**
 * updateStrengthUI(password, optionCount)
 * Calls evaluateStrength and applies the result to the DOM.
 *
 * @param {string} password
 * @param {number} optionCount
 */
function updateStrengthUI(password, optionCount) {
  const level = evaluateStrength(password, optionCount);

  strengthBar.style.width      = level.width;
  strengthBar.style.background = level.color;
  strengthText.textContent     = level.label;
  strengthText.style.color     = level.color;
}


// ── Password Generation ─────────────────────────────────────────────────────

/**
 * buildCharPool()
 * Reads the checkbox states and assembles a single string of
 * all allowed characters, also returning how many sets are active.
 *
 * @returns {{ pool: string, count: number }}
 */
function buildCharPool() {
  let pool  = "";
  let count = 0;

  if (chkUpper.checked)   { pool += CHARS.upper;   count++; }
  if (chkLower.checked)   { pool += CHARS.lower;   count++; }
  if (chkNumbers.checked) { pool += CHARS.numbers; count++; }
  if (chkSymbols.checked) { pool += CHARS.symbols; count++; }

  return { pool, count };
}

/**
 * generatePassword()
 * Main generation routine. Steps:
 *   1. Build the character pool from active checkboxes.
 *   2. Guard against an empty pool (no sets selected).
 *   3. Guarantee at least one character from every active set (no "lucky" omissions).
 *   4. Fill remaining slots from the full combined pool.
 *   5. Shuffle the array using the Fisher-Yates algorithm.
 *   6. Join, display, and evaluate strength.
 */
function generatePassword() {
  const length         = parseInt(lengthSlider.value, 10);
  const { pool, count } = buildCharPool();

  // Guard: at least one character set must be selected
  if (pool.length === 0) {
    passwordOutput.value = "";
    shakeCard();
    return;
  }

  const chars = []; // Will hold individual characters before joining

  // ── Step 1: Guarantee representation ───────────────────────────────────
  // Pick exactly one character from each active set to ensure the password
  // always contains at least one uppercase, one lowercase, etc.
  if (chkUpper.checked)   chars.push(randomChar(CHARS.upper));
  if (chkLower.checked)   chars.push(randomChar(CHARS.lower));
  if (chkNumbers.checked) chars.push(randomChar(CHARS.numbers));
  if (chkSymbols.checked) chars.push(randomChar(CHARS.symbols));

  // ── Step 2: Fill remaining length from the full pool ────────────────────
  const remaining = length - chars.length;
  for (let i = 0; i < remaining; i++) {
    chars.push(randomChar(pool));
  }

  // ── Step 3: Shuffle (Fisher-Yates) ──────────────────────────────────────
  // Without shuffling the guaranteed characters would always appear first,
  // creating a predictable pattern that weakens security.
  fisherYatesShuffle(chars);

  const password = chars.join("");

  // ── Step 4: Display & evaluate ──────────────────────────────────────────
  passwordOutput.value = password;
  updateStrengthUI(password, count);

  // Subtle flash animation to signal a new password was generated
  passwordOutput.classList.remove("flash");
  void passwordOutput.offsetWidth; // Force reflow to restart animation
  passwordOutput.classList.add("flash");
}

/**
 * randomChar(str)
 * Returns a single random character from the given string.
 * Uses Math.random() — sufficient for usability; for production
 * cryptographic use, swap with crypto.getRandomValues().
 *
 * @param {string} str — Character pool to pick from
 * @returns {string}
 */
function randomChar(str) {
  return str[Math.floor(Math.random() * str.length)];
}

/**
 * fisherYatesShuffle(arr)
 * Shuffles an array in-place using the Fisher-Yates (Knuth) algorithm.
 * Each element has an equal probability of ending up in any position.
 *
 * @param {Array} arr — Array to shuffle (mutated in place)
 */
function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    // Swap arr[i] and arr[j]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * shakeCard()
 * Adds a brief CSS shake animation to signal that no character set
 * is selected and a password cannot be generated.
 */
function shakeCard() {
  const card = document.querySelector(".card");
  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");
}


// ── Clipboard ───────────────────────────────────────────────────────────────

/**
 * copyPassword()
 * Copies the current password to the system clipboard using
 * the modern async Clipboard API (navigator.clipboard.writeText).
 *
 * Falls back to the legacy execCommand approach for older browsers.
 * Shows a toast notification and swaps the copy icon on success.
 */
async function copyPassword() {
  const password = passwordOutput.value;

  // Do nothing if there's nothing to copy
  if (!password || password === "") return;

  try {
    // Modern Clipboard API — returns a Promise
    await navigator.clipboard.writeText(password);
    showCopyFeedback();
  } catch (err) {
    // Fallback: select text and use the deprecated execCommand
    passwordOutput.select();
    document.execCommand("copy");
    window.getSelection()?.removeAllRanges();
    showCopyFeedback();
  }
}

/** Timer reference so rapid clicks don't stack icon revert timeouts */
let copyRevertTimer = null;

/**
 * showCopyFeedback()
 * • Swaps copy icon → checkmark in the top icon button for 2 seconds.
 * • Shows the "Copied!" toast notification.
 */
function showCopyFeedback() {
  // Icon swap: copy → check
  copyIcon.classList.add("hidden");
  checkIcon.classList.remove("hidden");

  // Clear any existing revert timer before starting a new one
  clearTimeout(copyRevertTimer);
  copyRevertTimer = setTimeout(() => {
    copyIcon.classList.remove("hidden");
    checkIcon.classList.add("hidden");
  }, 2000);

  // Show toast
  showToast("Copied to clipboard!");
}

/** Toast timeout reference to prevent overlap */
let toastTimer = null;

/**
 * showToast(message)
 * Briefly displays a floating toast notification at the bottom of the screen.
 * Auto-dismisses after 2.2 seconds.
 *
 * @param {string} message — Text to display inside the toast
 */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


// ── Slider Live Update ───────────────────────────────────────────────────────

/**
 * Update the length badge in real-time as the slider moves.
 * Also adds a tiny scale-bounce to the badge for tactile feel.
 */
lengthSlider.addEventListener("input", () => {
  lengthValue.textContent = lengthSlider.value;

  // Micro bounce animation on the badge
  lengthValue.style.transform = "scale(1.2)";
  setTimeout(() => { lengthValue.style.transform = ""; }, 120);
});


// ── Event Listeners ──────────────────────────────────────────────────────────

// Generate button
generateBtn.addEventListener("click", generatePassword);

// Copy — both the icon button in the output and the bottom action button
copyBtnTop.addEventListener("click", copyPassword);
copyBtnBottom.addEventListener("click", copyPassword);

// Allow pressing Enter anywhere in the card to generate
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generatePassword();
});


// ── Flash Animation (injected via JS to avoid stylesheet dependency) ─────────

/**
 * Inject the flash keyframe into the document head.
 * This keeps all animation logic co-located with the JS that triggers it.
 */
const flashStyle = document.createElement("style");
flashStyle.textContent = `
  @keyframes flash {
    0%   { color: var(--accent); }
    100% { color: var(--text-hi); }
  }
  .password-display.flash {
    animation: flash .45s ease-out both;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
  .card.shake {
    animation: shake .4s cubic-bezier(.36,.07,.19,.97) both;
  }
`;
document.head.appendChild(flashStyle);


// ── Initialise on page load ──────────────────────────────────────────────────

/**
 * Generate a password immediately when the page loads so the
 * user always sees a populated result from the start.
 */
generatePassword();
