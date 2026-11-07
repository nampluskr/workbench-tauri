// TypeScript sample. 심볼 확인 위치: 18행 (class Inventory > add > function normalize)
import { readFile } from "node:fs/promises";

export interface Item {
  readonly id: number;
  name: string;
  tags?: string[];
}

type Status = "ok" | "missing";

export class Inventory<T extends Item> {
  private items = new Map<number, T>();
  static readonly LIMIT = 0x40;

  add(item: T): Status {
    function normalize(name: string): string {
      return name.trim().toLowerCase();
    }
    item.name = normalize(item.name);
    this.items.set(item.id, item);
    return this.items.size <= Inventory.LIMIT ? "ok" : "missing";
  }

  async load(path: string): Promise<number> {
    const text = await readFile(path, "utf8");
    const parsed = JSON.parse(text) as T[];
    for (const entry of parsed) this.add(entry);
    return parsed.length;
  }
}

const pattern = /^[a-z]+\d{2,}$/i;
export const isCode = (value: string): boolean => pattern.test(value);
console.log(`limit is ${Inventory.LIMIT}`, 3.14, null, undefined);
