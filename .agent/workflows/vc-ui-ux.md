---
description: Frontend UI/UX Brainstorming Workflow - Focus on aesthetics, usability, and modern design
---

# 🎨 UI/UX DESIGN & BRAINSTORMING WORKFLOW (Frontend)

> **Use when**: User asks for "fresh design", "make it pretty", "UI/UX ideas", "brainstorming interface"

---

## FLOW SUMMARY

```
INSPIRATION → CONCEPTUALIZATION (Brainstorming) → MOCKUP/DESCRIBE → HUMAN REVIEW → IMPLEMENTATION STRATEGY
```

---

## 📥 PHASE 0: INPUT - Visual & Experience Goals

Request user to provide:
1.  **Vibe/Aesthetics**: Modern, Minimalist, Cyberpunk, Corporate, Playful?
2.  **Target Audience**: Who is this for?
3.  **Key Functionality**: What is the most important action on this screen?
4.  **Inspiration**: Any existing sites/apps the user likes?

> 💡 **TIP**: Aesthetics matter! Don't settle for "standard Bootstrap/Material". Aim for "Premium", "Polished", "Fluid".

---

## 🔍 PHASE 1: INSPIRATION & DISCOVERY

**Goal**: Gather ideas, trends, and "vibe check".

**Activities**:
- Identify current design trends relevant to the request (e.g., Glassmorphism, Bento Grids, Neubrutalism).
- Suggest color palettes and typography pairings.
- Analyze UX patterns that reduce friction.

### Output format:
```markdown
## 🎨 VISUAL DISCOVERY

### Recommended Aesthetic:
- **Style**: [e.g., Apple-style Minimalism]
- **Key Elements**: [e.g., Large whitespace, subtle shadows, blurred upgrades]
- **Color Palette**: 
  - Primary: `[Hex Code]`
  - Secondary: `[Hex Code]`
  - Accent: `[Hex Code]`

### UX Focus:
- [e.g., Reduce clicks to checkout]
- [e.g., Use skeleton loaders for perceived performance]
```

---

## 🧠 PHASE 2: CONCEPTUALIZATION (Brainstorming)

**Goal**: Propose concrete layout and interaction ideas.

**Activities**:
- Propose 2-3 different layout options.
- Describe micro-interactions (hover effects, transitions).
- "Wow" factor: What makes this special?

### Output format:
```markdown
## 💡 DESIGN CONCEPTS

### Option A: [Name, e.g., "The Sidebar Approach"]
- **Layout**: [Description]
- **Pros**: [Why it's good]
- **Cons**: [Trade-offs]

### Option B: [Name, e.g., "The Full-Screen Hero"]
- **Layout**: [Description]
- **Pros**: [Why it's good]
- **Cons**: [Trade-offs]

### ✨ The "Wow" Factor:
- [Describe a specific animation or interaction that adds polish]
```

---

## 📝 PHASE 3: MOCKUP & DETAILED DESCRIPTION

**Goal**: Visualize the chosen concept before coding.

**Activities**:
- Create a detailed text-based wireframe or ASCII mockup.
- Describe component hierarchy.
- List specific Tailwind classes (if applicable) or CSS variables to use.

### Output format:
```markdown
## 🖼️ VISUAL STRUCTURE

### Wireframe (Abstract):
```
+----------------------------------+
|  [Logo]       [Nav Links]        |
|                                  |
|  [     Headline Text      ]      |
|  [   Call to Action Btn   ]      |
|                                  |
|  [ Image/Graphic Placeholder ]   |
+----------------------------------+
```

### Component Details:
- **Card Component**: Rounded-xl, light border, backdrop-blur-md...
- **Typography**: Inter (Sans), H1 uses `tracking-tight`...
```

---

## 🚦 CHECKPOINT: DESIGN REVIEW

### ⚠️ STOP AND WAIT FOR APPROVAL

```markdown
## 🚦 DESIGN FEEDBACK

Here are the concepts. 
1. Which option (A or B) do you prefer?
2. Do you like the color palette?

✅ Ready to move to coding?
```

---

## 🛠️ PHASE 4: IMPLEMENTATION STRATEGY

**Goal**: Plan how to code this efficiently.

**Activities**:
- Identify UI libraries (Radix, HeadlessUI, Framer Motion).
- Set up Tailwind config expectations.
- Plan component breakdown for reusability.

### Output format:
```markdown
## 🛠️ CODING STRATEGY

### Tech Stack Recommendations:
- **Animation**: Framer Motion (for layout transitions)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS + `clsx`

### Next Steps (Coding):
- [ ] Create `theme.ts` with colors
- [ ] Build basic layout shell
- [ ] Implement individual components
```

---

## ⚡ QUICK REFERENCE

| Phase | Focus | Output |
|-------|-------|--------|
| Inspiration | Vibe & Trends | Color palettes, Style words |
| Brainstorming | Options & Layouts | Option A vs Option B |
| Mockup | Structure | Wireframes, Component specs |
| Strategy | Tech Stack | Libraries, CSS utility plan |

---

## 🌐 LANGUAGE NOTE
Works with **any language input**.
