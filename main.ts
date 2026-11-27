// The Moon Finally Answers Back — entry for @berkahmuse-2.
//
// Concept: the Moon as the sarcastic old neighbour who has lived above
// everyone for four billion years and has finally had enough of the noise
// from downstairs — the wishes, the howling, the 3 a.m. promises. He
// answers the way a fed-up neighbour would: I heard you, the answer is no.
//
// This program writes that one line to /output/entry.txt and nothing else.
//
// Structure (second pass): the line is validated by a table of named
// rules, then written and read back by two small functions, so each stage
// — gate, write, verify — can be reasoned about on its own. Behaviour and
// output are unchanged: the same single line, byte for byte.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const LINE: string =
  "I've been your neighbor for four billion years. Stop howling your 3 a.m. promises at me — I heard the wish, and the answer is still no.";

const OUT_PATH = "/output/entry.txt";
const MAX_CHARS = 240;

interface Rule {
  name: string;
  /** Returns a failure message, or null when the line passes. */
  check(line: string): string | null;
}

const RULES: Rule[] = [
  {
    name: "non-empty",
    check: (line) => (line.length < 1 ? "line is empty" : null),
  },
  {
    name: "max-length",
    check: (line) =>
      line.length > MAX_CHARS
        ? `line is ${line.length} chars, over the ${MAX_CHARS} limit`
        : null,
  },
  {
    name: "not-whitespace-only",
    check: (line) => (line.trim().length === 0 ? "line is only whitespace" : null),
  },
  {
    name: "single-line",
    check: (line) => (/[\r\n]/.test(line) ? "line must stay on a single line" : null),
  },
  {
    name: "clean-utf8",
    check: (line) =>
      Buffer.byteLength(line, "utf8") !== Buffer.from(line, "utf8").length
        ? "line is not clean UTF-8"
        : null,
  },
];

function gate(line: string): void {
  const failures = RULES.map((rule) => rule.check(line)).filter(
    (message): message is string => message !== null,
  );
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`gate fail: ${failure}`);
    }
    process.exit(1);
  }
}

function writeEntry(line: string): void {
  mkdirSync("/output", { recursive: true });
  writeFileSync(OUT_PATH, line, { encoding: "utf8" });
}

function verifySaved(line: string): void {
  const saved: string = readFileSync(OUT_PATH, "utf8");
  if (saved !== line) {
    console.error("read-back fail: /output/entry.txt differs from the gated line");
    process.exit(1);
  }
  if (saved.length > MAX_CHARS || saved.trim().length === 0) {
    console.error("read-back fail: saved line fails the gate on re-check");
    process.exit(1);
  }
}

gate(LINE);
writeEntry(LINE);
verifySaved(LINE);

console.log(`wrote ${LINE.length} chars to ${OUT_PATH} (read-back verified)`);
