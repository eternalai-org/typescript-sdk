---
description: Standard AI coding workflow - MUST follow when receiving NEW FEATURE requests from user
---

# 🚀 FEATURE DEVELOPMENT WORKFLOW - MANDATORY

> **Use when**: Create new features, add components, build new modules

---

## FLOW SUMMARY

```
INPUT → RESEARCH (survey patterns) → DESIGN (architecture) → HUMAN REVIEW (wait) → IMPLEMENT
```

---

## 📥 PHASE 0: INPUT - Gather Requirements

Request user to provide:

1. **Feature description** - What does this feature do?
2. **User story** - Who uses it? How?
3. **Acceptance criteria** - When is it considered complete?
4. **Constraints** (if any) - Tech stack, design system, conventions

> 💡 **TIP**: Clearer features = more accurate code. Ask thoroughly upfront!

---

## 🔍 PHASE 1: RESEARCH (Survey)

### Goal
- Understand current codebase
- Identify existing patterns
- Find reusable code
- **⚠️ NO CODE in this phase**

### Steps

1. **Survey architecture**
   - Folder structure
   - Existing patterns (hooks, components, services)
   - Design system / UI library in use

2. **Find related code**
   - Similar components for reference
   - Shared utilities
   - API patterns

3. **Output format**
   ```markdown
   ## 🔍 RESEARCH RESULTS

   ### Codebase Overview:
   - Tech stack: [Next.js, React, etc.]
   - UI Library: [HeroUI, Tailwind, etc.]
   - State management: [Context, Zustand, etc.]

   ### Patterns Found:
   - [Pattern 1]: [Description]
   - [Pattern 2]: [Description]

   ### Reusable Code:
   - `path/to/component.tsx` - [Description]
   - `path/to/hook.ts` - [Description]

   ### Complexity: [Low/Medium/High]
   ### Estimated Effort: [Number of files, components to create]
   ```

---

## 📐 PHASE 2: DESIGN (Architect)

### Goal
- Design feature architecture
- List components/files to create
- Define data flow
- **⚠️ NO CODE in this phase**

### Steps

1. **Component Design**
   - Component tree
   - Props interface
   - State requirements

2. **Data Flow Design**
   - API calls (if any)
   - State management
   - Side effects

3. **Create Implementation Plan**
   ```markdown
   ## 📐 FEATURE IMPLEMENTATION PLAN

   ### Feature Overview:
   [Feature summary]

   ### Architecture:
   ```
   src/
   ├── components/
   │   └── [FeatureName]/
   │       ├── index.tsx          [NEW]
   │       ├── [Component].tsx    [NEW]
   │       └── styles.scss        [NEW]
   ├── hooks/
   │   └── use[Feature].ts        [NEW]
   └── services/
       └── [feature].service.ts   [NEW]
   ```

   ### Component Breakdown:

   #### 1. `[ComponentName]` [NEW]
   - **Purpose**: [Goal]
   - **Props**: [Interface]
   - **State**: [Required local state]

   #### 2. `use[FeatureName]` hook [NEW]
   - **Purpose**: [Extracted logic]
   - **Returns**: [Hook API]

   ### Implementation Steps:
   1. [ ] Create folder structure
   2. [ ] Implement [Component 1]
   3. [ ] Implement [Component 2]
   4. [ ] Create hook `use[Feature]`
   5. [ ] Integrate into app
   6. [ ] Test & polish

   ### UI/UX Notes:
   - [Design guidelines]
   - [Responsive requirements]
   - [Animation/transition needs]

   ### Edge Cases:
   - [Edge case 1] - [How to handle]
   - [Edge case 2] - [How to handle]

   ### Verification Plan:
   - [ ] Build passes
   - [ ] Feature works as expected
   - [ ] Responsive on mobile
   - [ ] No console errors
   ```

---

## 🚦 CHECKPOINT: HUMAN REVIEW

### ⚠️ MUST STOP AND WAIT FOR USER APPROVAL

> For new features, reviewing design before coding is critical!

### Output format
```markdown
## 🚦 DESIGN REVIEW

I've completed the architecture design as shown above.

### Questions to Confirm:
1. [UI/UX question if any]
2. [Behavior question if needs clarification]

✅ Confirm design to start implementation?
❌ Any adjustments needed?
```

### Rules
- WAIT for user reply
- If user provides feedback → Return to Phase 2 to adjust design
- Don't hesitate to ask multiple questions!

---

## 🛠️ PHASE 3: IMPLEMENT (Build)

### Prerequisites
- ✅ User has approved design
- ✅ Requirements are clear

### Goal
- Clean, maintainable code
- Follow existing patterns
- Responsive & performant

### Implementation Order (recommended)

1. **Foundation first**
   - Types/Interfaces
   - Base components
   - Hooks

2. **Build up**
   - Composite components
   - Integrate hooks
   - Add styling

3. **Polish**
   - Error handling
   - Loading states
   - Edge cases
   - Animations

### Output format
```markdown
## ✅ FEATURE IMPLEMENTATION COMPLETE

### Created:
- [x] `src/components/[Feature]/index.tsx` - Main component
- [x] `src/components/[Feature]/SubComponent.tsx` - Child component
- [x] `src/hooks/use[Feature].ts` - Feature logic hook

### Usage:
```tsx
import { FeatureName } from '@/components/FeatureName';

<FeatureName prop1="value" onAction={handleAction} />
```

### Demo:
[How to test the feature]

### Known Limitations (if any):
- [Limitation 1]

### Future Improvements (if any):
- [Improvement 1]
```

---

## 📋 COMPARISON: BUG-FIX vs FEATURE

| Aspect | Bug-Fix (`/vc-fixing`) | Feature (`/vc-feature`) |
|--------|------------------------|-------------------------|
| Focus | Find & fix errors | Build new |
| Research | Trace bugs, read logs | Survey patterns, architecture |
| Plan | Fix approach | Component design, data flow |
| Review | Confirm fix | Review design/architecture |
| Implement | Minimal changes | Build components, hooks |

---

## ⚡ QUICK REFERENCE

| Phase | Allowed | NOT Allowed |
|-------|---------|-------------|
| Research | ✅ Read code, find patterns | ❌ Create new files |
| Design | ✅ Design, write plan | ❌ Code |
| Review | ✅ Ask, clarify | ❌ Implement without approval |
| Implement | ✅ Code per design | ❌ Change scope |

---

## 🌐 LANGUAGE NOTE

This workflow works with **any language input**. 
AI will understand and follow the workflow regardless of input language.
