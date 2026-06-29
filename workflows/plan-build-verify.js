export const meta = {
  name: 'plan-build-verify',
  description: 'Plan -> spec -> adversarial spec-check for a feature/fix. Returns plan+spec as the approval GATE; run the build phase after the user approves.',
  phases: [
    { title: 'Frame' },
    { title: 'Plan' },
    { title: 'Spec' },
    { title: 'Gate-Check' },
  ],
};

// Pass the task description as args (a string), e.g. Workflow({ name: 'plan-build-verify', args: 'add CSV export to users page' }).
const TASK = typeof args === 'string' && args.trim() ? args : 'No task provided. Pass the task via args.';

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['goal', 'steps'],
  properties: {
    goal: { type: 'string', description: 'The task restated as one verifiable outcome.' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['step', 'verify'],
        properties: {
          step: { type: 'string' },
          verify: { type: 'string', description: 'A concrete test/command/check that proves this step.' },
        },
      },
    },
  },
};

const CHECK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['sound', 'gaps'],
  properties: {
    sound: { type: 'boolean', description: 'Is the plan+spec internally consistent and buildable?' },
    gaps: { type: 'array', items: { type: 'string' }, description: 'Missing steps, unverifiable claims, scope risks.' },
  },
};

phase('Frame');
const frame = await agent(
  `Restate this task as ONE verifiable outcome (acceptance criterion). Name ambiguities, do not invent defaults silently.\n\nTASK: ${TASK}`,
  { label: 'frame', phase: 'Frame' }
);

phase('Plan');
const plan = await agent(
  `Given this framing, produce a minimal plan. Each step MUST carry a concrete verify: check. No speculative steps.\n\nFRAMING:\n${frame}`,
  { label: 'plan', phase: 'Plan', schema: PLAN_SCHEMA }
);

phase('Spec');
const spec = await agent(
  `Write a build spec for this plan: files to touch, functions/signatures, edge cases, and the test list. Preserve exact identifiers. Be surgical: change only what the goal requires.\n\nPLAN:\n${JSON.stringify(plan, null, 2)}`,
  { label: 'spec', phase: 'Spec' }
);

phase('Gate-Check');
// Adversarial: a fresh agent tries to find what is missing or unbuildable BEFORE any edit.
const check = await agent(
  `Adversarially review this plan + spec. Try to FALSIFY that it is complete and buildable. Default to listing gaps if unsure.\n\nPLAN:\n${JSON.stringify(plan)}\n\nSPEC:\n${spec}`,
  { label: 'gate-check', phase: 'Gate-Check', schema: CHECK_SCHEMA }
);

// This return IS the gate. Review goal/plan/spec/check before building.
// After approval, run your build phase (a second workflow or inline) that executes each step and runs its verify:.
return {
  task: TASK,
  goal: plan.goal,
  plan: plan.steps,
  spec,
  gateCheck: check,
  approved: false,
  note: 'GATE: review this output and approve before any edit. Build phase is a separate, post-approval run.',
};
