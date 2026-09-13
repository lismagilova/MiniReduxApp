export function applyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    body { font-family: Arial, sans-serif; }
    .app { max-width: 700px; margin: 20px auto; }
    nav, form, .task { display: flex; gap: 8px; margin: 10px 0; }
    input:not([type=checkbox]) { flex: 1; }
    .tasks { list-style: none; padding: 0; }
    .title { flex: 1; }
    .done { text-decoration: line-through; }
    .error { color: red; }
    pre { overflow: auto; }
  `;
  document.head.appendChild(style);
}
