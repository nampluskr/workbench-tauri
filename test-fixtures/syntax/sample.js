// JavaScript sample.
import { readFile } from "node:fs/promises";

/**
 * Counts words in a file.
 * @param {string} path
 * @returns {Promise<number>}
 */
export async function countWords(path) {
  const text = await readFile(path, "utf8");
  return text.split(/\s+/).filter(Boolean).length;
}

class Greeter {
  #prefix = "Hello";
  static count = 0;

  constructor(name) {
    this.name = name ?? "world";
    Greeter.count += 1;
  }

  greet() {
    return `${this.#prefix}, ${this.name}!`;
  }
}

const values = [1, 2.5, 0xff, 1e3, true, null, undefined];
const doubled = values.filter((v) => typeof v === "number").map((v) => v * 2);
const html = /* html */ `<b>${doubled.length}</b>`;
console.log(new Greeter().greet(), doubled, html);
