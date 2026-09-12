import fs from "node:fs/promises";
import path from "node:path";

export async function loadSkillIndex() {
  const raw = await fs.readFile(path.resolve("skills/index.json"), "utf8");
  return JSON.parse(raw);
}

export async function loadSkill(id) {
  const index = await loadSkillIndex();
  const item = index.find(x => x.id === id);
  if (!item) throw new Error(`Unknown skill: ${id}`);
  const content = await fs.readFile(path.resolve(item.script), "utf8");
  return { ...item, content };
}

export function chooseSkills(message, index) {
  const text = message.toLowerCase();
  return index.filter(skill =>
    skill.triggers.some(trigger => text.includes(trigger))
  ).slice(0, 3);
}
