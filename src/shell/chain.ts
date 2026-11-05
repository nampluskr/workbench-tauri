import { commands } from "../keymap/keyboard.ts";

/**
 * Several areas bind the same action name (menu::SelectNext, project_panel::RemoveFromProject): `handler` acts only while
 * `when` holds, otherwise the handler registered before this one runs.
 */
export function chain(name: string, when: () => boolean, handler: () => void): void {
  const previous = commands.get(name);
  commands.set(name, () => (when() ? handler() : previous?.()));
}
