# 🎨 CrowdSpark Design System & Theme Specification

A comprehensive, production-grade guide to replicating and implementing the **CrowdSpark Glassmorphism Design System** in any other web application or SaaS product.

---

## 🌟 1. Design Philosophy

- **Aesthetic**: Premium Glassmorphism with deep space dark mode, crisp clean light mode, and vibrant multi-stop gradient accents (Indigo, Purple, Pink).
- **Typography**: Ultra-clean sans-serif (`Inter`) with high visual hierarchy, tight letter-spacing on titles, and high contrast readability.
- **Micro-Interactions**: Smooth hover lifts (`translateY`), glowing shadows, fluid gradient animations, and subtle backdrop blurs (`backdrop-filter: blur(20px)`).
- **Mobile First**: Touch-friendly touch targets, horizontal scrollable tab bars with hidden scrollbars, responsive 2x2 grids, and swipe hints for tables.

---

## 🔤 2. Typography

### Primary Font
- **Family**: `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Import**:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  ```

### Typography Scale
| Element | Font Size | Weight | Line Height | Letter Spacing | Special Effect |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `3.5rem` (56px) | `900` | `1.1` | `-0.03em` | Gradient Text Clip |
| **Page Title** | `2.0rem` (32px) | `800` | `1.2` | `-0.02em` | Gradient / Text Primary |
| **Card Header** | `1.25rem` (20px) | `800` | `1.3` | `-0.01em` | Solid Text Primary |
| **Section Label** | `0.85rem` (13.6px)| `700` | `1.4` | `+0.05em` | Uppercase |
| **Body Text** | `1.0rem` (16px) | `400` / `500`| `1.6` | `0` | Text Primary / Secondary |
| **Small / Muted** | `0.825rem` (13px)| `400` / `600`| `1.5` | `0` | Text Muted |

---

## 🎨 3. Design Tokens (CSS Variables)

Add these CSS variables to your global stylesheet (`index.css` / `globals.css`):

```css
:root {
  /* ==========================================================================
     DARK THEME (Default)
     ========================================================================== */
  --bg-primary: #0a0e1a;            /* Deep obsidian canvas background */
  --bg-secondary: #151b2e;          /* Elevated surface / section background */
  --bg-tertiary: #1f2937;           /* Card borders & tertiary layers */
  --bg-card: rgba(31, 41, 55, 0.55);/* Glass card with backdrop blur */
  --bg-input: rgba(15, 23, 42, 0.65);/* Semi-transparent input background */
  --bg-input-focus: rgba(15, 23, 42, 0.95);

  /* Vibrant Accent Palette */
  --accent-primary: #6366f1;        /* Indigo */
  --accent-secondary: #8b5cf6;      /* Violet / Purple */
  --accent-tertiary: #ec4899;       /* Hot Pink */

  /* Semantic Status Colors */
  --success: #10b981;              /* Emerald Green */
  --warning: #f59e0b;              /* Amber Gold */
  --error: #ef4444;                /* Rose Red */
  --info: #3b82f6;                 /* Sky Blue */

  /* Text Colors */
  --text-primary: #f8fafc;          /* High contrast text */
  --text-secondary: #94a3b8;        /* Subtitles and secondary info */
  --text-muted: #64748b;            /* Footnotes and placeholders */

  /* Borders & Dividers */
  --border-color: rgba(255, 255, 255, 0.1);
  --border-color-hover: rgba(255, 255, 255, 0.22);
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;

  /* Elevation Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.35);
  --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 30px rgba(99, 102, 241, 0.35);
}

[data-theme="light"] {
  /* ==========================================================================
     LIGHT THEME
     ========================================================================== */
  --bg-primary: #f8fafc;            /* Clean light grey canvas */
  --bg-secondary: #ffffff;          /* Pure white surfaces */
  --bg-tertiary: #f1f5f9;           /* Subtle contrast sections */
  --bg-card: #ffffff;               /* Clean white card */
  --bg-input: #f8fafc;
  --bg-input-focus: #ffffff;

  /* Accents Remain Vibrant in Light Mode */
  --accent-primary: #6366f1;
  --accent-secondary: #8b5cf6;
  --accent-tertiary: #ec4899;

  /* Semantic Status */
  --success: #10b981;
  --warning: #d97706;
  --error: #ef4444;
  --info: #2563eb;

  /* Text Colors */
  --text-primary: #0f172a;          /* Deep navy/black */
  --text-secondary: #475569;        /* Slate */
  --text-muted: #94a3b8;            /* Grey */

  /* Borders */
  --border-color: #cbd5e1;
  --border-color-hover: #94a3b8;

  /* Elevation Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 10px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 20px 30px -5px rgba(0, 0, 0, 0.08);
  --shadow-glow: 0 0 30px rgba(99, 102, 241, 0.15);
}
```

---

## 🌗 4. Theme Switching Implementation

### React Theme Hook & Toggle Component

```tsx
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(prev => !prev)}
      className="btn btn-secondary"
      style={{ padding: '0.6rem', borderRadius: '50%', width: '42px', height: '42px' }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
    </button>
  );
}
```

---

## 🧩 5. Core Component Patterns

### 1. Buttons

```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  font-size: 0.95rem;
  gap: 0.5rem;
  font-family: var(--font-family);
  text-decoration: none;
}

/* Primary Button with Flowing Animated Gradient */
.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  background-size: 200% 200%;
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4), 0 0 35px rgba(139, 92, 246, 0.2);
  animation: gradientShift 3.5s ease infinite;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 28px rgba(99, 102, 241, 0.5), 0 0 50px rgba(139, 92, 246, 0.3);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
}

/* Secondary / Glass Button */
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1.5px solid var(--border-color);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

[data-theme="light"] .btn-secondary {
  background: #ffffff;
  border-color: #cbd5e1;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
}
```

---

### 2. Glassmorphic Card

```css
.card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--border-color);
  border-radius: 1.5rem;
  padding: 1.75rem;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* Top Subtle Highlight Line */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
}

.card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}
```

---

### 3. Gradient Title

```css
.title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #f8fafc 0%, #a5b4fc 50%, #c084fc 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

[data-theme="light"] .title {
  background: linear-gradient(135deg, #0f172a 0%, #6366f1 50%, #8b5cf6 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

### 4. Form Controls & Inputs

```css
.input,
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-input);
  border: 1.5px solid var(--border-color);
  border-radius: 0.85rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: var(--font-family);
  box-sizing: border-box;
  transition: all 0.2s ease;
  outline: none;
}

.input:focus,
input:focus,
select:focus,
textarea:focus {
  border-color: var(--accent-primary);
  background: var(--bg-input-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.input::placeholder {
  color: var(--text-muted);
}
```

---

### 5. Stats Cards (KPI Counters)

```html
<div class="card admin-stat-card">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <!-- Icon Container -->
    <div style="padding: 0.9rem; border-radius: 1rem; background: rgba(99, 102, 241, 0.12);">
      <svg width="24" height="24" fill="none" stroke="#6366f1" stroke-width="2">...</svg>
    </div>
    <!-- Value & Label -->
    <div>
      <div style="font-size: 1.85rem; font-weight: 800; color: var(--text-primary); line-height: 1.1;">
        1,420
      </div>
      <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.2rem;">
        Total Users
      </div>
      <div style="font-size: 0.75rem; color: var(--success); font-weight: 700; margin-top: 0.2rem;">
        +14% this week
      </div>
    </div>
  </div>
</div>
```

---

### 6. Filter & Search Bar

```html
<div class="admin-filter-bar">
  <!-- Search Input with Clear Button -->
  <div style="position: relative;">
    <input type="text" class="input" placeholder="Search..." style="padding-left: 2.5rem;" />
  </div>

  <!-- Role / Category Select -->
  <select class="input">
    <option value="all">All Roles</option>
    <option value="admin">Admins</option>
    <option value="user">Users</option>
  </select>

  <!-- Sort Select -->
  <select class="input">
    <option value="newest">Sort: Newest First</option>
    <option value="oldest">Sort: Oldest First</option>
  </select>
</div>
```

```css
.admin-filter-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.5rem;
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--border-color);
}
```

---

### 7. Responsive Tables

```html
<div class="admin-table-container">
  <table class="admin-table">
    <thead>
      <tr>
        <th>User</th>
        <th>Status</th>
        <th>Tokens</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div style="font-weight: 700;">Alex Johnson</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">alex@example.com</div>
        </td>
        <td>
          <span class="badge badge-success">Active</span>
        </td>
        <td style="font-weight: 800; color: var(--accent-primary);">⚡ 100</td>
        <td style="text-align: right;">
          <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
            Manage
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.admin-table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 0.85rem;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 700px;
}

.admin-table th {
  padding: 0.85rem 1rem;
  border-bottom: 1.5px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  background: var(--bg-secondary);
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-primary);
}
```

---

### 8. Badges & Chips

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.badge-primary {
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-error {
  background: rgba(239, 68, 68, 0.15);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

---

### 9. Blurred Modal Overlay

```html
<div class="admin-modal-overlay">
  <div class="card admin-modal-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h3 style="margin: 0; font-size: 1.35rem; font-weight: 800;">Modal Title</h3>
      <button class="btn btn-secondary" style="padding: 0.4rem 0.6rem;">✕</button>
    </div>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Modal body content goes here.</p>
    <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

```css
.admin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.admin-modal-card {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1.5px solid var(--border-color);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

---

## 🎬 6. Animations & Keyframes

```css
/* Dynamic Background Gradient Shift for Primary Buttons & Highlights */
@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Modal and Element Entrance Fade-in with Blur Resolution */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* Floating Ambient Orbs */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-16px) rotate(2deg);
  }
}

/* Ambient Pulsing Glow */
@keyframes pulseGlow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.02);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

---

## 📱 7. Responsive Breakpoints

| Breakpoint | Target Screen | Adjustments |
| :--- | :--- | :--- |
| `> 1024px` | Desktop / Laptop | 4-column Stats grid, expansive tables, 1400px container |
| `<= 1024px`| Tablet Landscape | 2-column Stats grid, padding scaled to 1.5rem |
| `<= 768px` | Tablet / Mobile | 2-column Stats, single column filter bars, horizontal touch tabs, swipe hints |
| `<= 480px` | Small Mobile | Title scaled to `2.0rem`, cards padding `1.25rem`, full-width modal |

---

## ⚡ 8. Tailwind CSS Configuration (Optional)

If your other product uses **Tailwind CSS**, map the design system inside `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          card: 'var(--bg-card)',
          input: 'var(--bg-input)'
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          tertiary: 'var(--accent-tertiary)'
        },
        status: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          error: 'var(--error)',
          info: 'var(--info)'
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)'
        }
      },
      borderRadius: {
        'card': '1.5rem',
        'btn': '1rem'
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'glass': 'var(--shadow-lg)'
      }
    }
  }
};
```

---

## 🚀 9. Quick Drop-In Checklist for a New Product

1. **Install Font**: Add `Inter` from Google Fonts to your `index.html` or root layout.
2. **Copy CSS Variables**: Paste Section 3 into your global CSS (`index.css` / `globals.css`).
3. **Mount Theme Toggle**: Copy the `ThemeToggle` React component and place it in your Navbar / Header.
4. **Use Base Utility Classes**: Apply `.card`, `.btn-primary`, `.btn-secondary`, `.title`, and `.badge` to your pages.
5. **Enjoy a unified, cohesive, top-tier aesthetic across all your applications!**
