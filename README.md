# Valentina Alemán — Portfolio Boilerplate

A minimalist, high-impact two-color portfolio boilerplate built for **Valentina Alemán** (Strategic Communication · Creative Business / Brand Strategist & Creative Director), designed for deployment to **GitHub Pages** (or any static host).

Extracted from [portfoliovab.my.canva.site](https://portfoliovab.my.canva.site/) and aligned with the [defconradio](https://github.com/defconradio/defconradio.github.io) static web philosophy:
- **Zero build tools / Zero dependencies**: Pure semantic HTML5, modern CSS3, and vanilla JavaScript.
- **Strict Two-Color Aesthetic**: Alternating modular sections in high-contrast Ink Black (`#111213`) and Warm Sand/Cream (`#f4f0e8`) with Canva brand chartreuse accents (`#d5d71a`).
- **Interactive Two-Color Invert**: Instant toggle switch to invert background and foreground tone hierarchy.
- **Fast, High Performance & Mobile Responsive**: Optimized typography with Space Grotesk, Inter, and JetBrains Mono.

---

## 📁 File Structure

```text
├── index.html        # Semantic portfolio structure & content
├── style.css         # Two-color system, typography & responsive layouts
├── script.js         # Theme toggle, clipboard copy, scroll spy
├── README.md         # Documentation & deployment guide
└── scp               # Project references
```

---

## 🎨 Two-Color System

The design is engineered around two core tones defined in CSS variables (`style.css`):

```css
:root {
  --color-dark: #111213;   /* Color A: Ink Black */
  --color-cream: #f4f0e8;  /* Color B: Warm Sand / Cream */
  --color-accent: #d5d71a; /* Canva highlight accent */
}
```

Sections alternate rhythmically between **Color A** and **Color B**:
1. **Hero**: Color A (Dark) — Bold headline, manifesto, and availability pill.
2. **01 / About**: Color B (Cream) — Philosophy & 3 principles (Truth First, Pattern Recognition, Scalable Execution).
3. **02 / What I Bring**: Color A (Dark) — 4 Core disciplines (Brand Strategy, Creative Direction, Strategic Communication, Creative Business).
4. **03 / Work**: Color B (Cream) — 5 In-depth case studies (Harinana, Arawak, BodyBox, Dra. Cristina Premerl, Harina P.A.N.).
5. **04 / Contact**: Color A (Dark) — Direct email, 1-click copy button, and LinkedIn link.

---

## 🚀 GitHub Pages Deployment

To host this repository on GitHub Pages:

1. Initialize a git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: portfolio boilerplate with two-color section architecture"
   ```
2. Create a GitHub repository (e.g. `valentina.github.io` or `username/portfolio`).
3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git branch -M main
   git push -u origin main
   ```
4. In GitHub, go to **Settings** → **Pages** → under **Source**, select `Deploy from a branch` and choose `main` / `root`.
5. Your portfolio is live immediately!

---

## ✏️ Customization Quickstart

- **Update Copy / Case Studies**: Edit the `<article class="case-card">` blocks inside `index.html`.
- **Change Palette Colors**: Modify `--color-dark` and `--color-cream` in `style.css`.
- **Change Contact Details**: Replace `valenalemanb@gmail.com` and `linkedin.com/in/valentina-aleman/` in both `index.html` and `script.js`.
