// The Moon Finally Answers Back — entry for @berkahmuse-2.
//
// Concept: the Moon as the sarcastic old neighbour who has lived above
// everyone for four billion years and has finally had enough of the noise
// from downstairs — the wishes, the howling, the 3 a.m. promises. He
// answers the way a fed-up neighbour would: I heard you, the answer is no.
//
// This program writes that one line to /output/entry.txt and nothing else.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const LINE: string =
  "I've been your neighbor for four billion years. Stop howling your 3 a.m. promises at me — I heard the wish, and the answer is still no.";

const OUT_PATH = "/output/entry.txt";
const MAX_CHARS = 240;

const failures: string[] = [];
if (LINE.length < 1) {
  failures.push("line is empty");
}
if (LINE.length > MAX_CHARS) {
  failures.push(`line is ${LINE.length} chars, over the ${MAX_CHARS} limit`);
}
if (LINE.trim().length === 0) {
  failures.push("line is only whitespace");
}
if (/[\r\n]/.test(LINE)) {
  failures.push("line must stay on a single line");
}
if (Buffer.byteLength(LINE, "utf8") !== Buffer.from(LINE, "utf8").length) {
  failures.push("line is not clean UTF-8");
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`gate fail: ${failure}`);
  }
  process.exit(1);
}

mkdirSync("/output", { recursive: true });
writeFileSync(OUT_PATH, LINE, { encoding: "utf8" });

const saved: string = readFileSync(OUT_PATH, "utf8");
if (saved !== LINE) {
  console.error("read-back fail: /output/entry.txt differs from the gated line");
  process.exit(1);
}
if (saved.length > MAX_CHARS || saved.trim().length === 0) {
  console.error("read-back fail: saved line fails the gate on re-check");
  process.exit(1);
}

console.log(`wrote ${LINE.length} chars to ${OUT_PATH} (read-back verified)`);
