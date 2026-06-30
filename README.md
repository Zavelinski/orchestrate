# orchestrate

Opinionated agent-orchestration for Claude Code: run a feature or fix through a **plan -> spec -> build -> verify** cycle with a hard approval gate and a `verify:` check on every step, instead of hand-rolling subagent orchestration each time. Built on the Workflow tool.

## Why

Power users say orchestration (planner/spec/builder/verifier) is DIY and that agents change too much code with weak gating. Orchestration is also where measured gains come from: AI21 Maestro reaches top-tier SWE-bench Verified purely by allocating compute across plan + multi-path execution ([ai21.com](https://www.ai21.com/blog/test-time-compute-swe-bench/)), and self-consistency adds up to +17.9pp on reasoning ([arXiv:2203.11171](https://arxiv.org/abs/2203.11171)). This packages structured planning + adversarial verification with a real gate.

## What you get

- `/orchestrate` (skill): the FRAME -> PLAN -> SPEC -> GATE -> BUILD -> VERIFY cycle and its rules (hard gate, verify per step, surgical build, adversarial verify).
- `workflows/plan-build-verify.js`: a runnable Workflow template that does frame/plan/spec + an adversarial spec-check and returns the result as the gate. Copy into your project's `.claude/workflows/` and adapt.

Skill-only (plus a template), no per-session overlay cost.

## Install (Claude Code, local directory marketplace)

```jsonc
// ~/.claude/settings.json
"extraKnownMarketplaces": {
  "orchestrate": { "source": { "source": "directory", "path": "C:\\Users\\<you>\\orchestrate" } }
},
"enabledPlugins": { "orchestrate@orchestrate": true }
```

Or after publishing: `"source": { "source": "github", "repo": "<you>/orchestrate" }`.

## Usage

Run `/orchestrate` (or "plan spec build verify") for multi-step work. The cycle stops at GATE (plan + spec) for your approval before any edit. For larger tasks, adapt `workflows/plan-build-verify.js`.

## Limits

The hard gate depends on honoring it; in headless Workflow mode the "gate" is a phase boundary, not an OS-level block. The cited numbers are from their benchmarks; measure your own outcome (tests green, scope held).

## License

MIT

---

Part of the **[claude-code-skills](https://github.com/Zavelinski/claude-code-skills)** collection: a one-line [Claude Code](https://claude.com/claude-code) plugin marketplace of focused skills, plugins, and MCP servers.

```
/plugin marketplace add Zavelinski/claude-code-skills
```
