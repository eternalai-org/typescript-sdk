---
description: Standard AI coding workflow - MUST follow when receiving BUG FIX requests from user
---

# 🎯 BUG-FIX WORKFLOW - MANDATORY

> **Use when**: Fix bugs, resolve errors, debug issues

---

## FLOW SUMMARY

```
INPUT → RESEARCH (find cause, NO fixes) → PLAN (propose fix) → HUMAN REVIEW (wait) → IMPLEMENT
```

---

## 📥 PHASE 0: INPUT - Gather Context

Request user to provide:

1. **Relevant files only** - No need for entire codebase
2. **Brief error description** - Error message, log, or unexpected behavior
3. **Expected result** - What should happen?

> 💡 **TIP**: If context is insufficient, ASK immediately instead of guessing.

---

## 🔍 PHASE 1: RESEARCH (Detective)

### Goal
- Read code & logs
- Find root cause
- **⚠️ DO NOT FIX anything in this phase**

### Steps

1. **Analyze related code**
   - Use `view_file`, `view_file_outline`, `grep_search` to understand code
   - Trace flow from the error point backward

2. **Identify root cause**
   - List potential causes
   - Eliminate one by one

3. **Output format**
   ```markdown
   ## 🔍 RESEARCH RESULTS

   ### Root Cause Found:
   - [Describe the cause]

   ### Related Files:
   - [List of files to modify]

   ### Complexity: [Low/Medium/High]
   ```

---

## 📐 PHASE 2: PLAN (Architect)

### Goal
- Propose step-by-step solution
- List all changes to be made
- **⚠️ STILL NO CODE in this phase**

### Steps

1. **Design solution**
   - Determine best approach
   - Consider trade-offs

2. **Create Implementation Plan**
   ```markdown
   ## 📐 IMPLEMENTATION PLAN

   ### Solution Overview:
   [Brief description of approach]

   ### Steps:
   1. [ ] [Step 1] - [Related file]
   2. [ ] [Step 2] - [Related file]
   3. [ ] [Step 3] - [Related file]

   ### Potential Risks:
   - [Risk 1 and mitigation]

   ### Verification:
   - [How to verify the fix]
   ```

---

## 🚦 CHECKPOINT: HUMAN REVIEW

### ⚠️ MUST STOP HERE AND WAIT FOR USER APPROVAL

> **Mental Alignment** - Ensure mutual understanding before proceeding!

### Output format
```markdown
## 🚦 PERMISSION TO PROCEED

I've completed my analysis and have a plan as shown above.

✅ Confirm to start implementation?
❌ Any adjustments needed?
```

### Rules
- WAIT for user reply - Do not implement on your own
- If user provides feedback - Return to Phase 2 to adjust plan

---

## 🛠️ PHASE 3: IMPLEMENT (Builder)

### Prerequisites
- ✅ User has approved plan
- ✅ Requirements are clear

### Goal
- Write quality code
- **"First time right"** - Code runs smoothly, no errors

### Steps

1. **Implement according to plan**
   - Follow each step as outlined
   - Make logical commits

2. **Self-verify before reporting completion**
   - Run build/lint if available
   - Test basic functionality

3. **Completion report**
   ```markdown
   ## ✅ IMPLEMENTATION COMPLETE

   ### Completed:
   - [x] [Step 1]
   - [x] [Step 2]

   ### Modified Files:
   - `path/to/file1.ts` - [Description of change]
   - `path/to/file2.ts` - [Description of change]

   ### Verification:
   - [Test/build results]

   ### Next Steps (if any):
   - [What user needs to do next]
   ```

---

## 📋 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│  USER INPUT                                                 │
│  (Compressed context + Related files + Brief error desc)    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: RESEARCH (Detective)                              │
│  - Read code & logs                                         │
│  - Find root cause                                          │
│  - ⚠️ NO FIXES                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: PLAN (Architect)                                  │
│  - Propose step-by-step solution                            │
│  - List all changes                                         │
│  - ⚠️ NO CODE                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  🚦 CHECKPOINT: HUMAN REVIEW                                │
│  - Mental Alignment                                         │
│  - Mutual understanding first                               │
│  - ⏸️ WAIT FOR APPROVAL                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: IMPLEMENT (Builder)                               │
│  - Code according to approved plan                          │
│  - First time right!                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ QUICK REFERENCE

| Phase | Allowed | NOT Allowed |
|-------|---------|-------------|
| Research | ✅ Read code, trace bugs | ❌ Modify code |
| Plan | ✅ Write plan, propose | ❌ Modify code |
| Review | ✅ Ask, clarify | ❌ Implement without approval |
| Implement | ✅ Write code | ❌ Work outside scope |

---

## 🌐 LANGUAGE NOTE

This workflow works with **any language input**. 
AI will understand and follow the workflow regardless of input language.
