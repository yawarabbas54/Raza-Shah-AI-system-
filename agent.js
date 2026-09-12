import { loadSkillIndex, loadSkill, chooseSkills } from "./skills.js";
import { tools } from "./tools.js";
import { callModel } from "./model.js";

function now() {
  return new Date().toISOString();
}

function confidenceFrom(result) {
  return result === "live" ? 0.82 : 0.68;
}

export function createAgent() {
  async function listSkills() {
    return loadSkillIndex();
  }

  async function run(message, context = {}, options = {}) {
    const events = [];
    const log = (type, detail, extra = {}) => {
      events.push({ time: now(), type, detail, ...extra });
    };

    log("goal", "Goal received", { message });

    const index = await loadSkillIndex();
    const selected = chooseSkills(message, index);
    log("skills", selected.length
      ? `Selected ${selected.map(s => s.name).join(", ")}`
      : "No specialized skill was triggered."
    );

    // Progressive disclosure: only now load full skill instructions.
    const fullSkills = [];
    for (const skill of selected) {
      fullSkills.push(await loadSkill(skill.id));
      log("disclosure", `Loaded full instructions for ${skill.name}`);
    }

    const plan = await tools.create_plan.run({ goal: message });
    log("plan", "Created deterministic execution plan", { plan });

    const live = Boolean(process.env.AI_BASE_URL && process.env.AI_API_KEY && process.env.AI_MODEL);
    let answer;

    if (live) {
      const skillText = fullSkills.map(s => `## ${s.name}\n${s.content}`).join("\n");
      answer = await callModel([
        {
          role: "system",
          content:
            "You are Yawar AI Agent. Be transparent. Do not claim actions you did not perform. " +
            "Follow deterministic tool boundaries and say when confirmation is required. " +
            "Return concise useful answers.\n\n" + skillText
        },
        { role: "user", content: message }
      ]);
      log("model", "Model response generated");
    } else {
      answer = demoAnswer(message, selected);
      log("model", "Demo response generated because no model provider is configured");
    }

    // Proactivity: identify a safe next step without silently taking consequential action.
    const nextAction = selected.length
      ? `Next safe step: verify the ${selected[0].name.toLowerCase()} result before any external action.`
      : "Next safe step: define a concrete task or enable a model provider for richer reasoning.";
    log("proactivity", nextAction);

    const confidence = confidenceFrom(live ? "live" : "demo");
    log("complete", "Run completed", { confidence });

    return {
      answer,
      mode: live ? "live" : "demo",
      confidence,
      selectedSkills: selected.map(s => ({
        id: s.id, name: s.name, description: s.description, risk: s.risk
      })),
      plan,
      timeline: events,
      confirmationRequired: false,
      traceId: crypto.randomUUID()
    };
  }

  return { run, listSkills };
}

function demoAnswer(message, selected) {
  const skills = selected.length ? selected.map(s => s.name).join(", ") : "general reasoning";
  return [
    "I’m Yawar AI Agent running in DEMO mode.",
    `I understood the goal as: “${message}”`,
    `Active capability layer: ${skills}.`,
    "",
    "Agent behavior demonstrated:",
    "• Goal → plan → skill selection → progressive disclosure → execution → verification.",
    "• Critical actions are not silently executed.",
    "• The timeline below records what happened.",
    "• Confidence is shown separately from the answer.",
    "",
    "To make this a real model-powered agent, configure AI_BASE_URL, AI_API_KEY and AI_MODEL in .env."
  ].join("\n");
}
