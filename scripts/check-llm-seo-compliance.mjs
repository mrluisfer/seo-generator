#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function expectMatch(relativePath, pattern, message) {
  const content = readFile(relativePath);
  if (!content) {
    return;
  }

  if (!pattern.test(content)) {
    failures.push(`${message} (${relativePath})`);
  }
}

const requiredFiles = [
  "app/robots.ts",
  "app/sitemap.ts",
  "docs/seo-for-llms-playbook.md",
  "docs/seo-llm-review-checklist.md",
  "lib/get-json-ld.ts",
  "lib/get-llm-content-blocks.ts",
  "app/_components/seo-form/index.tsx",
  "app/_components/generate-tags/generate-tags-modal.tsx",
];

requiredFiles.forEach((file) => {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing required file: ${file}`);
  }
});

expectMatch("app/layout.tsx", /alternates\s*:/, "Canonical metadata configuration is missing");
expectMatch("app/layout.tsx", /openGraph\s*:/, "OpenGraph metadata is missing");
expectMatch("app/layout.tsx", /twitter\s*:/, "Twitter metadata is missing");
expectMatch("lib/get-json-ld.ts", /"@type":\s*"Article"/, "Article schema generation is missing");
expectMatch("lib/get-json-ld.ts", /"@type":\s*"FAQPage"/, "FAQ schema generation is missing");
expectMatch("lib/get-json-ld.ts", /"@type":\s*"BreadcrumbList"/, "Breadcrumb schema generation is missing");
expectMatch("app/_components/seo-form/index.tsx", /TL;DR/, "TL;DR field is missing in the form");
expectMatch("app/_components/seo-form/index.tsx", /Key Facts/, "Key Facts field is missing in the form");
expectMatch("app/_components/seo-form/index.tsx", /FAQ/, "FAQ field is missing in the form");
expectMatch("app/_components/seo-form/index.tsx", /Author/, "Author field is missing in the form");
expectMatch(
  "app/_components/generate-tags/generate-tags-modal.tsx",
  /robots\.txt/,
  "robots.txt output tab is missing",
);
expectMatch(
  "app/_components/generate-tags/generate-tags-modal.tsx",
  /sitemap\.xml/,
  "sitemap.xml output tab is missing",
);
expectMatch(
  "app/_components/generate-tags/generate-tags-modal.tsx",
  /JSON-LD/,
  "JSON-LD output tab is missing",
);

if (failures.length > 0) {
  console.error("LLM SEO compliance checks failed:\n");
  failures.forEach((failure) => {
    console.error(`- ${failure}`);
  });
  process.exit(1);
}

console.log("LLM SEO compliance checks passed.");
