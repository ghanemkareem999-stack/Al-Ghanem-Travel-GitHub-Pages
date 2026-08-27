import { readFileSync, writeFileSync } from "node:fs";

const project = "/home/ubuntu/al-ghanem-travel";
const batchPath = `${project}/docs/generated/download-all-live-website-images-idm.bat`;
const outputPath = `${project}/docs/generated/all-live-website-image-links-2026-08-27.txt`;
const batch = readFileSync(batchPath, "utf8");
const entryPattern = /^idman \/d "([^"]+)" \/p "[^"]+\\([^"\\]+)" \/f "[^"]+" \/n \/a$/gm;
const grouped = new Map();
for (const match of batch.matchAll(entryPattern)) {
  const [, url, folder] = match;
  const list = grouped.get(folder) ?? [];
  list.push(url);
  grouped.set(folder, list);
}
if (grouped.size === 0) throw new Error("No IDM entries found.");
const lines = [
  "Al Ghanem Travel — all current live-site image URLs",
  "Review/download reference only. Grouped by the folder name used in the IDM script.",
];
for (const folder of [...grouped.keys()].sort((a, b) => a.localeCompare(b))) {
  lines.push(folder, ...grouped.get(folder));
}
writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${[...grouped.values()].reduce((total, urls) => total + urls.length, 0)} URLs across ${grouped.size} folders to ${outputPath}`);
