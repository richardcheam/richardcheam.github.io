// Wrap every Markdown/MDX table in the site's scrolling `.table-wrap` region at
// build time, so wide tables scroll inside themselves on narrow screens instead
// of widening the page. It works without JavaScript; public/js/site.js skips
// tables that already have this wrapper.
const isWrapper = (node) => node.type === "element" && (node.properties?.className ?? []).includes("table-wrap");

function wrapTables(node) {
  if (!node.children || isWrapper(node)) return;
  node.children = node.children.map((child) => {
    if (child.type !== "element" || child.tagName !== "table") {
      wrapTables(child);
      return child;
    }
    const label = child.properties?.ariaLabel;
    return {
      type: "element",
      tagName: "div",
      properties: { className: ["table-wrap"], role: "region", tabIndex: 0, ariaLabel: typeof label === "string" ? label : "Table" },
      children: [child],
    };
  });
}

export default function rehypeTableWrap() {
  return wrapTables;
}
