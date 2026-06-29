---
name: orchestrate
description: Run a feature or fix through an opinionated plan -> spec -> build -> verify cycle with a hard approval gate, instead of hand-rolling subagent orchestration. Use for multi-step work where you want a plan and spec approved before any edit, and every step verified. Trigger with /orchestrate or "orchestrate this", "plan spec build verify", "run this with a gate".
version: "0.1.0"
user-invocable: true
metadata:
  emoji: "🎼"
---

# orchestrate

A packaged orchestration cycle so you stop hand-rolling planner/spec/builder/verifier every time. Built on the Workflow tool, with a hard gate (no edits before approval) and a `verify:` check attached to every step.

## Why this exists (evidence)

- Power users say agent orchestration (planner/spec/builder/verifier) is DIY, and that agents change too much code with weak gating. This packages the pattern.
- Orchestration moves the needle: AI21 Maestro reaches top-tier SWE-bench Verified purely by allocating compute across plan + multi-path execution. Self-consistency (sampling + vote) adds up to +17.9pp on reasoning. The cycle below applies both ideas: structured planning plus adversarial verification.

## The cycle

```
FRAME   -> restate the goal as a verifiable outcome
PLAN    -> steps, each with an explicit verify: check
SPEC    -> a dedicated sub-agent writes the spec to a file
GATE    -> HARD STOP: present plan + spec for user approval; no edits before OK
BUILD   -> execute each step, surgically; run its verify: immediately
VERIFY  -> adversarially confirm the whole change does what was claimed
```

Rules:
- The GATE is real. Produce plan + spec and stop. Do not edit files until the user approves. In a headless Workflow there is no interactive prompt, so the gate = phase 1 returns the plan/spec and you (or the user) review before invoking phase 2 (build).
- Every PLAN step carries a `verify:` (a test, command, or check). A step with no verify is not done, it is hopeful.
- BUILD is surgical: change only what the step requires (compose with karpathy / surgical-diff).
- VERIFY is adversarial: try to falsify the claim, do not just re-assert it (compose with adversarial-verify / testsmith).

## How to run

- Small task: follow the cycle inline, stop at GATE for approval, then build + verify.
- Larger task: use the bundled Workflow template `workflows/plan-build-verify.js` as a starting point. It does the FRAME/PLAN/SPEC fan-out and an adversarial check of the spec, returns the result (that is the gate), and you invoke the build phase after approval. Copy it into your project's `.claude/workflows/` and adapt.
- Route cheap stages (drafting, scanning) to a cheaper model via model-router; keep judging/verifying on the strong model.

## Composes with

- `writing-plans` / `brainstorming`: front of the cycle.
- `karpathy-coding` / `surgical-diff`: keep BUILD minimal.
- `adversarial-verify` / `testsmith`: the VERIFY stage.
- `model-router`: per-stage model cost.
- `context-warden`: keep each stage's context lean.

## Honest limits

- The hard gate depends on you honoring it; the skill enforces the discipline, not the runtime. In headless mode the "gate" is a phase boundary, not an OS-level block.
- The Maestro/self-consistency numbers are from their benchmarks; the cycle is sound engineering, but measure your own outcome (tests green, scope held).
