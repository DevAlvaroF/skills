#!/usr/bin/env node
// Stamps each bundled script from its one source here into every skill that
// runs it, byte for byte.
//
// A skill is installed alone and cannot reach into another, so each one that
// runs a script carries its own copy under `scripts/`. Edit the source in this
// directory, never a copy, then run this; prompt-kanban's tests fail when any
// copy differs from its source. It writes only the copies listed below, and
// stops before writing anything when a source or a target skill is missing.
//
//   node scripts/sync-bundled-scripts.mjs

import {copyFileSync, existsSync, mkdirSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FLAVOURS = ["makerkit-custom", "modified-matt"];
/** The four skills of each flavour that read the tracker, and all of them commit. */
const READERS = FLAVOURS.flatMap((flavour) =>
    ["to-spec", "to-issues", "implement", "final-review"].map((skill) => `${flavour}/${flavour}-${skill}`),
);

const BUNDLES = [
    {script: "check-tracker-contract.sh", skills: READERS},
    {script: "commit-route.sh", skills: [...READERS, "kanban/kanban-jobs"]},
];

const missing = BUNDLES.flatMap(({script, skills}) => [
    join("scripts", script),
    ...skills.map((skill) => join("skills", skill, "SKILL.md")),
]).filter((path) => !existsSync(join(root, path)));
if (missing.length > 0) {
    console.error(`nothing written; missing:\n  ${missing.join("\n  ")}`);
    process.exit(1);
}

for (const {script, skills} of BUNDLES) {
    for (const skill of skills) {
        mkdirSync(join(root, "skills", skill, "scripts"), {recursive: true});
        copyFileSync(join(root, "scripts", script), join(root, "skills", skill, "scripts", script));
    }
    console.log(`${script}: ${skills.length} copies`);
}
