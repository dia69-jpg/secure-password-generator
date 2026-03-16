# secure-password-generator
A modern and secure password generator built with HTML, CSS, and JavaScript.  Includes customizable length, character sets, strength indicator, and clipboard copy.
# 🔐 Secure Password Generator
 
> Craft strong, unique passwords in seconds — with a sleek dark editorial UI.
 
**Live Demo → [dia69-jpg.github.io/secure-password-generator](https://dia69-jpg.github.io/secure-password-generator/)**
 
<img width="1110" height="1262" alt="image" src="https://github.com/user-attachments/assets/7f8c9b13-9b9a-4de2-be0d-314d1977dd15" />

 
---
 
## ✨ Features
 
- **Cryptographically shuffled** — uses Fisher-Yates algorithm to ensure every character position is truly random
- **Guaranteed character diversity** — at least one character from each active set is always included
- **Real-time strength meter** — scores passwords across 4 levels: Weak / Fair / Good / Strong
- **One-click copy** — clipboard support via the modern Clipboard API with legacy fallback
- **Instant feedback** — toast notifications, icon swap on copy, and a flash animation on generate
- **Fully responsive** — works beautifully on mobile, tablet, and desktop
- **Keyboard accessible** — press `Enter` anywhere to generate a new password
 
---
 
## 🎛️ Options
 
| Control | Range / Values |
|---|---|
| **Length** | 8 – 30 characters (slider) |
| **Uppercase** | A–Z |
| **Lowercase** | a–z |
| **Numbers** | 0–9 |
| **Symbols** | `! @ # $ % ^ & * ( ) - _ = + …` |
 
---
 
## 🧠 How It Works
 
```
1. User selects character sets + length
2. One character is guaranteed from each active set
3. Remaining slots are filled from the combined pool
4. Array is shuffled via Fisher-Yates
5. Strength is evaluated and the UI updates
```
 
**Strength scoring:**
 
| Score | Level |
|---|---|
| ≤ 1 | Weak |
| 2 | Fair |
| 3–4 | Good |
| 5–6 | Strong |
 
Score = number of active character sets (max 4) + 1 if length ≥ 16 + 1 if length ≥ 24.
 
---
 
## 🗂️ Project Structure
 
```
secure-password-generator/
├── index.html   # Markup & accessible layout
├── style.css    # Design tokens, dark theme, animations
└── script.js    # Password logic, strength eval, clipboard
```
 
No build step. No dependencies. Pure HTML, CSS, and JavaScript.
 
---
 
## 🚀 Getting Started
 
```bash
# Clone the repo
git clone https://github.com/dia69-jpg/secure-password-generator.git
 
# Open in your browser
open index.html
```
 
Or just visit the **[live demo](https://dia69-jpg.github.io/secure-password-generator/)** — no setup needed.
 
---
 
## 🎨 Design Highlights
 
- **Dark editorial palette** — deep slate `#0d0f1a` with lavender/indigo accents
- **Typography** — [Syne](https://fonts.google.com/specimen/Syne) (display) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (password output)
- **Ambient background** — animated dot-grid and glow blobs for depth
- **Micro-interactions** — slider thumb scale, badge bounce, card shake on empty input
- **Strength bar** — animated width transition with color-coded levels
 
---
 
## 👩‍💻 Author
 
**Aya DIOUANI**  
Built with care — zero frameworks, zero dependencies.
 
---
 
## 📄 License
 
## 📄 License
 
This project is open source and available under the [MIT License](LICENSE).
