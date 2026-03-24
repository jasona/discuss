import TurndownService from "turndown";
import { marked } from "marked";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Add task list support
turndown.addRule("taskListItem", {
  filter: (node) =>
    node.nodeName === "LI" &&
    node.getAttribute("data-type") === "taskItem",
  replacement: (content, node) => {
    const checked = (node as HTMLElement).getAttribute("data-checked") === "true";
    return `${checked ? "- [x]" : "- [ ]"} ${content.trim()}\n`;
  },
});

// Add table support
turndown.addRule("table", {
  filter: "table",
  replacement: (_content, node) => {
    const table = node as HTMLTableElement;
    const rows = Array.from(table.rows);
    if (rows.length === 0) return "";

    const lines: string[] = [];
    rows.forEach((row, i) => {
      const cells = Array.from(row.cells).map(
        (cell) => ` ${cell.textContent?.trim() || ""} `
      );
      lines.push(`|${cells.join("|")}|`);
      if (i === 0) {
        lines.push(
          `|${cells.map((c) => "-".repeat(Math.max(c.length, 3))).join("|")}|`
        );
      }
    });
    return `\n${lines.join("\n")}\n\n`;
  },
});

/**
 * Convert Tiptap HTML to Markdown string
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return "";
  return turndown.turndown(html);
}

/**
 * Convert Markdown string to HTML for Tiptap
 */
export function markdownToHtml(md: string): string {
  if (!md) return "";
  return marked.parse(md, { async: false }) as string;
}
