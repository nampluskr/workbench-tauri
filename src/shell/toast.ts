/** D-14: a minimal notification, one DOM line per message; only the wording is judged. Click to dismiss. */
export function notify(lines: string[]): void {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "alert");
  toast.append(...lines.map((text) => Object.assign(document.createElement("div"), { textContent: text })));
  toast.onclick = () => toast.remove();
  document.body.append(toast);
}
