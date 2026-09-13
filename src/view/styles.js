export function applyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; }
    body { margin: 0; background: #f4f4f4; color: #333; font: 16px/1.5 Arial, sans-serif; }
    .app { max-width: 720px; margin: 24px auto; padding: 20px; background: white; }
    h1 { margin: 0 0 16px; font-size: 26px; } h2 { font-size: 18px; }
    nav, .add-form, .edit-form { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    a { color: #345a95; padding: 4px 8px; } a.selected { background: #e9eef6; }
    input, button { font: inherit; }
    input:not([type=checkbox]) { flex: 1; min-width: 0; padding: 8px; border: 1px solid #bbb; }
    button { padding: 6px 10px; border: 1px solid #aaa; background: #eee; cursor: pointer; }
    .tasks { list-style: none; padding: 0; }
    .task { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 0; border-bottom: 1px solid #ddd; }
    .title { flex: 1; min-width: 120px; overflow-wrap: anywhere; }
    .done { text-decoration: line-through; color: #777; }
    .edit-form { width: 100%; margin: 0; }
    .muted, .empty { color: #777; } .error { color: #a22; }
    .error:empty, .empty:empty { display: none; }
    .state { margin-top: 24px; } summary { cursor: pointer; }
    pre { overflow: auto; max-height: 240px; font-size: 13px; }
    @media (max-width: 600px) { .app { margin: 12px; padding: 12px; } }
  `;
  document.head.appendChild(style);
}
