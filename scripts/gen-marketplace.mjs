#!/usr/bin/env node
// Regenerates .claude-plugin/marketplace.json from whatever is on disk.
//
// The manifest is what makes `npx skills add DevAlvaroF/skills`
// show "Makerkit Skills" and "Alvaro Skills" as toggleable groups in its
// picker: the CLI reads plugins[].skills and tags each skill with the owning
// plugin name. A skill missing from the manifest still installs, but lands in
// an "Other" group. Run this after adding or renaming a skill.
//
//   node scripts/gen-marketplace.mjs

import { readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const GROUPS = [
  {
    dir: "makerkit",
    name: "makerkit-skills",
    description:
      "Makerkit-aware engineering skills: they know about docs/ .mdoc product docs, the fork/upstream remote pair, and the monorepo AGENTS.md layout.",
    keywords: ["makerkit", "engineering", "tdd", "code-review", "grilling"],
  },
  {
    dir: "alvaro",
    name: "alvaro-skills",
    description:
      "The same engineering skills without the Makerkit-specific assumptions. For any repo.",
    keywords: ["engineering", "tdd", "code-review", "grilling"],
  },
];

const skillsIn = (group) => {
  const base = join(root, "skills", group);
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(base, e.name, "SKILL.md")))
    .map((e) => `./${e.name}`)
    .sort();
};

const manifest = {
  name: "devalvarof-skills",
  owner: { name: "Alvaro F", url: "https://github.com/DevAlvaroF" },
  description:
    "Engineering skills for Claude Code and Codex, in two flavours: Makerkit-aware and generic.",
  plugins: GROUPS.map((g) => ({
    name: g.name,
    source: `./skills/${g.dir}`,
    description: g.description,
    category: "engineering",
    keywords: g.keywords,
    skills: skillsIn(g.dir),
  })),
};

mkdirSync(join(root, ".claude-plugin"), { recursive: true });
writeFileSync(
  join(root, ".claude-plugin/marketplace.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

for (const p of manifest.plugins) {
  console.log(`${p.name}: ${p.skills.length} skills`);
}
